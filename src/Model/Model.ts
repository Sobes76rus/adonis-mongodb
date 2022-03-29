import { Exception } from '@poppinss/utils';
import _, { cloneDeep, isEqual, pickBy, snakeCase } from 'lodash';
import {
  ClientSession,
  Collection,
  CollectionInsertOneOptions,
  CommonOptions,
  Cursor,
  FilterQuery,
  FindOneOptions,
  UpdateOneOptions,
} from 'mongodb';
import pluralize from 'pluralize';

import { Mongodb } from '../Mongodb';

import { proxyHandler } from './proxyHandler';

interface ModelConstructor<M> {
  $database: Mongodb;
  new (...args: any[]): M;
  _computeCollectionName(): string;
  getCollection(): Promise<Collection>;
}

interface IModelOptions {
  collection: Collection;
  session?: ClientSession;
}

type Impossible<K extends keyof any> = {
  [P in K]: never;
};

type NoExtraProperties<T, U extends T = T> = U &
  Impossible<Exclude<keyof U, keyof T>>;

type ModelReadonlyFields =
  | 'isDirty'
  | 'toJSON'
  | 'save'
  | 'delete'
  | 'merge'
  | 'fill'
  | 'createdAt'
  | 'updatedAt';

class FindResult<T> {
  private $filter: FilterQuery<T>;
  private $options: FindOneOptions<T> | undefined;
  private $cursor: Cursor<T>;
  private $collection: Collection<T>;
  private $constructor: ModelConstructor<T>;

  public constructor(
    filter: FilterQuery<T>,
    options: FindOneOptions<T> | undefined,
    cursor: Cursor<T>,
    collection: Collection<T>,
    constructor: ModelConstructor<T>,
  ) {
    this.$filter = filter;
    this.$options = options;
    this.$cursor = cursor;
    this.$collection = collection;
    this.$constructor = constructor;
  }

  public async all(): Promise<T[]> {
    const result = await this.$cursor.toArray();
    return result.map(
      (value) =>
        new this.$constructor(
          value,
          {
            collection: this.$collection,
            session: this.$options?.session,
          },
          true,
        ),
    );
  }

  public async count(): Promise<number> {
    const options =
      this.$options !== undefined
        ? {
            limit: this.$options.limit,
            maxTimeMS: this.$options.maxTimeMS,
            readPreference: this.$options.readPreference,
            session: this.$options.session,
            skip: this.$options.skip,
          }
        : undefined;
    return this.$collection.countDocuments(this.$filter, options);
  }

  public async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    for await (const value of this.$cursor) {
      yield new this.$constructor(
        value,
        {
          collection: this.$collection,
          session: this.$options?.session,
        },
        true,
      );
    }
  }
}

function computeCollectionName(constructorName: string): string {
  return snakeCase(pluralize(constructorName));
}

export class Model {
  private static $hooks: Map<string, Map<any, Array<Function>>> = new Map();
  protected static $indexes: any[];
  public static $allModels: typeof Model[] = [];
  public static $database: Mongodb;
  public static collectionName?: string;

  public readonly _id: any;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  protected $collection: Collection | null = null;
  protected $originalData: any;
  protected $currentData: any;
  protected $isDeleted: boolean;
  protected $options: IModelOptions;
  protected $alreadySaved: boolean;

  public constructor(
    dbObj?: Record<string, unknown>,
    options?: IModelOptions,
    alreadyExists = false,
  ) {
    if (dbObj) {
      this.$originalData = alreadyExists === true ? cloneDeep(dbObj) : {};
      this.$currentData = dbObj;
    } else {
      this.$originalData = {};
      this.$currentData = {};
    }

    if (options !== undefined) {
      this.$options = options;
      this.$collection = options.collection;
    }

    this.$alreadySaved = alreadyExists;
    this.$isDeleted = false;
    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, proxyHandler);
  }

  public static $setDatabase(database: Mongodb): void {
    this.$database = database;
  }

  public static _computeCollectionName(): string {
    if (this.collectionName) {
      return this.collectionName;
    }
    return computeCollectionName(this.name);
  }

  public static async getCollection<T extends Model>(
    this: ModelConstructor<T>,
  ): Promise<Collection<T>> {
    if (!this.$database) {
      throw new Error('Model should only be accessed from IoC container');
    }
    const collectionName = this._computeCollectionName();
    const connection = this.$database.connection();
    return connection.collection(collectionName);
  }

  public static async create<T extends Model>(
    this: ModelConstructor<T>,
    value: Omit<T, '_id' | 'id' | ModelReadonlyFields> &
      Partial<Pick<T, '_id'>>,
    options?: CollectionInsertOneOptions,
  ): Promise<T> {
    const collection = await this.getCollection();
    const instance = new this(
      value,
      {
        collection,
        session: options?.session,
      },
      false,
    );
    await instance.save(options);
    return instance;
  }

  public static async findOne<T extends Model>(
    this: ModelConstructor<T>,
    filter: FilterQuery<T>,
    options?: FindOneOptions<Omit<T, ModelReadonlyFields>>,
  ): Promise<T | null> {
    const collection = await this.getCollection();
    const result = await collection.findOne(
      filter,
      options as FindOneOptions<unknown>,
    );
    if (result === null) return null;
    return new this(result, { collection, session: options?.session }, true);
  }

  public static async find<T extends Model>(
    this: ModelConstructor<T>,
    filter: FilterQuery<T>,
    options?: FindOneOptions<Omit<T, ModelReadonlyFields>>,
  ): Promise<FindResult<T>> {
    const collection = await this.getCollection();
    const cursor = collection.find(filter, options as FindOneOptions<unknown>);
    return new FindResult(filter, options, cursor, collection, this);
  }

  public static async findById<T extends Model>(
    this: ModelConstructor<T>,
    id: unknown,
    options?: FindOneOptions<Omit<T, ModelReadonlyFields>>,
  ): Promise<T | null> {
    const collection = await this.getCollection();
    const result = await collection.findOne(
      { _id: id },
      options as FindOneOptions<unknown>,
    );
    if (result === null) return null;
    return new this(result, { collection, session: options?.session }, true);
  }

  public static async findByIdOrThrow<T extends Model>(
    this: ModelConstructor<T>,
    id: unknown,
    options?: FindOneOptions<Omit<T, ModelReadonlyFields>>,
  ): Promise<T> {
    const collection = await this.getCollection();
    const result = await collection.findOne(
      { _id: id },
      options as FindOneOptions<unknown>,
    );
    if (result === null) {
      throw new Error(
        `document ${String(id)} not found in ${this._computeCollectionName()}`,
      );
    }
    return new this(result, { collection, session: options?.session }, true);
  }

  protected [Symbol.for('nodejs.util.inspect.custom')](): any {
    return {
      model: this.constructor.name,
      originalData: this.$originalData,
      currentData: this.$currentData,
      isDirty: this.isDirty,
    };
  }

  protected $dirty(): Record<string, unknown> {
    return pickBy(this.$currentData, (value, key) => {
      return (
        this.$originalData[key] === undefined ||
        !isEqual(this.$originalData[key], value)
      );
    });
  }

  protected $ensureNotDeleted(): void {
    if (this.$isDeleted) {
      throw new Error('this entry was deleted from the database');
    }
  }

  protected async $ensureCollection() {
    if (!Model.$database) {
      throw new Error('Model should only be accessed from IoC container');
    }
    if (this.$collection !== null) return this.$collection;

    const connection = Model.$database.connection();
    this.$collection = await connection.collection(
      (this.constructor as typeof Model)._computeCollectionName(),
    );
    return this.$collection;
  }

  protected $prepareToSet() {
    const dirty = this.$dirty();
    const dirtyEntries = Object.entries(dirty);
    if (dirtyEntries.length === 0 && this.$alreadySaved) {
      return null;
    }

    const toSet: { [key: string]: unknown } = {};
    const now = new Date();
    if (this.$currentData.createdAt === undefined) {
      this.$currentData.createdAt = now;
      toSet.createdAt = now;
    }
    this.$currentData.updatedAt = now;
    toSet.updatedAt = now;

    for (const [dirtyKey, dirtyValue] of dirtyEntries) {
      toSet[dirtyKey] = dirtyValue;
    }
    return toSet;
  }

  public get id() {
    return this.$currentData._id;
  }

  public get isDirty(): boolean {
    return Object.keys(this.$dirty()).length > 0;
  }

  public toJSON(): unknown {
    return this.$currentData;
  }

  public async save(options?: UpdateOneOptions): Promise<boolean> {
    this.$ensureNotDeleted();
    const collection = await this.$ensureCollection();

    if (this.$alreadySaved === false) {
      await this.callHooks('beforeCreate');
    } else {
      await this.callHooks('beforeUpdate');
    }

    const toSet = this.$prepareToSet();
    if (toSet === null) return false;
    if (this.$alreadySaved === false) {
      const result = await collection.insertOne(toSet, {
        session: this.$options?.session,
        ...options,
      });
      this.$currentData._id = result.insertedId;
    } else {
      await collection.updateOne(
        { _id: this.$currentData._id },
        { $set: toSet },
        { session: this.$options?.session, ...options },
      );
    }
    this.$originalData = cloneDeep(this.$currentData);
    if (this.$alreadySaved === false) {
      this.$alreadySaved = true;
      await this.callHooks('afterCreate');
    } else {
      await this.callHooks('afterUpdate');
    }

    return true;
  }

  public async delete(options?: CommonOptions): Promise<boolean> {
    this.$ensureNotDeleted();
    await this.callHooks('beforeDelete');
    const collection = await this.$ensureCollection();
    const result = await collection.deleteOne(
      {
        _id: this.$currentData._id,
      },
      { session: this.$options.session, ...options },
    );
    this.$isDeleted = true;
    await this.callHooks('afterDelete');
    return result.deletedCount === 1;
  }

  public merge<
    T extends Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>
  >(
    values: NoExtraProperties<
      Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>,
      T
    >,
  ): this {
    Object.entries(values).forEach(([key, value]) => {
      this.$currentData[key] = value;
    });
    return this;
  }

  public fill<
    T extends Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>
  >(
    values: NoExtraProperties<
      Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>,
      T
    >,
  ) {
    const createdAt = this.$currentData.createdAt;
    this.$currentData = {
      _id: this.id,
    };
    if (createdAt) this.$currentData.createdAt = createdAt;
    return this.merge(values);
  }

  public static addHook(
    name: string,
    target: Model | AutoIncrementModel,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<Function>,
  ) {
    if (descriptor.value === undefined) {
      throw new Exception('Undefined descriptor value is not allowed');
    }

    const targetType = target.constructor;

    if (!Model.$hooks.has(name)) {
      Model.$hooks.set(name, new Map());
    }

    if (!Model.$hooks.get(name)?.has(targetType)) {
      Model.$hooks.get(name)?.set(targetType, []);
    }

    Model.$hooks.get(name)?.get(targetType)?.push(descriptor.value);
  }

  protected async callHooks(name: string, ...args: any[]) {
    for (let type of Model.$hooks.get(name)?.keys() ?? []) {
      if (this instanceof type) {
        for (let trigger of Model.$hooks.get(name)?.get(type) ?? []) {
          await trigger.apply(this, args);
        }
      }
    }
  }

  public static prepareIndexes(target: typeof Model) {
    let cls = target;
    let obj = [];

    while (cls) {
      for (let index of cls.$indexes?.reverse() ?? []) {
        obj.push(parseIndex(index));
      }

      cls = Object.getPrototypeOf(cls.prototype)?.constructor;
    }

    return obj.reverse();
  }
}

export class AutoIncrementModel extends Model {
  public constructor(
    dbObj?: Record<string, unknown>,
    options?: IModelOptions,
    alreadyExists = false,
  ) {
    super(dbObj, options, alreadyExists);
  }

  public async save(options?: UpdateOneOptions): Promise<boolean> {
    this.$ensureNotDeleted();
    const collection = await this.$ensureCollection();

    if (this.$alreadySaved === false) {
      await this.callHooks('beforeCreate');
    } else {
      await this.callHooks('beforeUpdate');
    }

    const toSet = this.$prepareToSet() ?? {};
    if (toSet === null) return false;

    if (this.$alreadySaved === false) {
      const connection = AutoIncrementModel.$database.connection();
      const counterCollection = await connection.collection<{ count: number }>(
        '__adonis_mongodb_counters',
      );

      const doc = await counterCollection.findOneAndUpdate(
        { _id: computeCollectionName(this.constructor.name) },
        { $inc: { count: 1 } },
        { session: options?.session, upsert: true },
      );
      const newCount = toSet._id ?? (doc.value ? doc.value.count + 1 : 1);
      toSet._id = newCount;
      await collection.insertOne(toSet, {
        session: this.$options?.session,
        ...options,
      });
      this.$currentData._id = newCount;
    } else {
      await (this.$collection as Collection).updateOne(
        { _id: this.$currentData._id },
        { $set: toSet },
        { session: this.$options?.session, ...options },
      );
    }
    this.$originalData = cloneDeep(this.$currentData);

    if (this.$alreadySaved === false) {
      this.$alreadySaved = true;
      await this.callHooks('afterCreate');
    } else {
      await this.callHooks('afterUpdate');
    }

    return true;
  }
}

export function register(target: typeof Model | typeof AutoIncrementModel) {
  Model.$allModels.push(target);
}

export function parseIndex(index: any) {
  if (_.isString(index)) {
    const [keys, ...opts] = index.split(':');

    return {
      keys: _.reduce(
        keys.split(','),
        (obj, key) => {
          const c: string = key[0];
          key = key.substr(1);
          let ind: 1 | -1 | 'hashed' | 'text' = 1;

          switch (c) {
            case '+': {
              break;
            }
            case '-': {
              ind = -1;
              break;
            }
            case '#': {
              ind = 'hashed';
              break;
            }
            case '@': {
              ind = 'text';
              break;
            }
            default:
              throw new Error(`Invalid index: ${index}`);
          }

          // @ts-ignore
          obj[key] = ind;
          return obj;
        },
        {},
      ),

      opts: _.reduce(
        opts,
        (obj, key) => {
          switch (key) {
            case 'unique':
              // @ts-ignore
              obj.unique = true;
              break;
            default:
              throw new Error(`Undefined index option: ${index}`);
          }

          return obj;
        },
        {},
      ),
    };
  }

  if (_.has(index, 'keys') && _.has(index, 'opts')) {
    return index;
  }

  throw new Error(`Invalid index: ${index}`);
}
