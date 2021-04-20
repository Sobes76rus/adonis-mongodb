import { ClientSession, Collection, CollectionInsertOneOptions, CommonOptions, Cursor, FilterQuery, FindOneOptions, UpdateOneOptions } from 'mongodb';
import { Mongodb } from '../Mongodb';
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
declare type Impossible<K extends keyof any> = {
    [P in K]: never;
};
declare type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;
declare type ModelReadonlyFields = 'isDirty' | 'toJSON' | 'save' | 'delete' | 'merge' | 'fill' | 'createdAt' | 'updatedAt';
declare class FindResult<T> {
    private $filter;
    private $options;
    private $cursor;
    private $collection;
    private $constructor;
    constructor(filter: FilterQuery<T>, options: FindOneOptions<T> | undefined, cursor: Cursor<T>, collection: Collection<T>, constructor: ModelConstructor<T>);
    all(): Promise<T[]>;
    count(): Promise<number>;
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
export declare class Model {
    private static $hooks;
    static $database: Mongodb;
    static collectionName?: string;
    readonly _id: any;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    protected $collection: Collection | null;
    protected $originalData: any;
    protected $currentData: any;
    protected $isDeleted: boolean;
    protected $options: IModelOptions;
    protected $alreadySaved: boolean;
    constructor(dbObj?: Record<string, unknown>, options?: IModelOptions, alreadyExists?: boolean);
    static $setDatabase(database: Mongodb): void;
    static _computeCollectionName(): string;
    static getCollection<T extends Model>(this: ModelConstructor<T>): Promise<Collection<T>>;
    static create<T extends Model>(this: ModelConstructor<T>, value: Omit<T, '_id' | 'id' | ModelReadonlyFields> & Partial<Pick<T, '_id'>>, options?: CollectionInsertOneOptions): Promise<T>;
    static findOne<T extends Model>(this: ModelConstructor<T>, filter: FilterQuery<T>, options?: FindOneOptions<Omit<T, ModelReadonlyFields>>): Promise<T | null>;
    static find<T extends Model>(this: ModelConstructor<T>, filter: FilterQuery<T>, options?: FindOneOptions<Omit<T, ModelReadonlyFields>>): Promise<FindResult<T>>;
    static findById<T extends Model>(this: ModelConstructor<T>, id: unknown, options?: FindOneOptions<Omit<T, ModelReadonlyFields>>): Promise<T | null>;
    static findByIdOrThrow<T extends Model>(this: ModelConstructor<T>, id: unknown, options?: FindOneOptions<Omit<T, ModelReadonlyFields>>): Promise<T>;
    protected $dirty(): Record<string, unknown>;
    protected $ensureNotDeleted(): void;
    protected $ensureCollection(): Promise<Collection<any>>;
    protected $prepareToSet(): {
        [key: string]: unknown;
    } | null;
    get id(): any;
    get isDirty(): boolean;
    toJSON(): unknown;
    save(options?: UpdateOneOptions): Promise<boolean>;
    delete(options?: CommonOptions): Promise<boolean>;
    merge<T extends Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>>(values: NoExtraProperties<Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>, T>): this;
    fill<T extends Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>>(values: NoExtraProperties<Partial<Omit<this, '_id' | 'id' | ModelReadonlyFields>>, T>): this;
    static addHook(name: string, target: Model, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
    protected callHooks(name: string, ...args: any[]): Promise<void>;
}
export declare class AutoIncrementModel extends Model {
    constructor(dbObj?: Record<string, unknown>, options?: IModelOptions);
    save(options?: UpdateOneOptions): Promise<boolean>;
}
export {};
