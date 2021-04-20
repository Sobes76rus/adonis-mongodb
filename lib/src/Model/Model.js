"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoIncrementModel = exports.Model = void 0;
const utils_1 = require("@poppinss/utils");
const lodash_1 = require("lodash");
const pluralize_1 = __importDefault(require("pluralize"));
const proxyHandler_1 = require("./proxyHandler");
class FindResult {
    constructor(filter, options, cursor, collection, constructor) {
        this.$filter = filter;
        this.$options = options;
        this.$cursor = cursor;
        this.$collection = collection;
        this.$constructor = constructor;
    }
    async all() {
        const result = await this.$cursor.toArray();
        return result.map((value) => {
            var _a;
            return new this.$constructor(value, {
                collection: this.$collection,
                session: (_a = this.$options) === null || _a === void 0 ? void 0 : _a.session,
            }, true);
        });
    }
    async count() {
        const options = this.$options !== undefined
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
    async *[Symbol.asyncIterator]() {
        var _a;
        for await (const value of this.$cursor) {
            yield new this.$constructor(value, {
                collection: this.$collection,
                session: (_a = this.$options) === null || _a === void 0 ? void 0 : _a.session,
            });
        }
    }
}
function computeCollectionName(constructorName) {
    return lodash_1.snakeCase(pluralize_1.default(constructorName));
}
class Model {
    constructor(dbObj, options, alreadyExists = false) {
        this.$collection = null;
        if (dbObj) {
            this.$originalData = alreadyExists === true ? lodash_1.cloneDeep(dbObj) : {};
            this.$currentData = dbObj;
        }
        else {
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
        return new Proxy(this, proxyHandler_1.proxyHandler);
    }
    static $setDatabase(database) {
        this.$database = database;
    }
    static _computeCollectionName() {
        if (this.collectionName) {
            return this.collectionName;
        }
        return computeCollectionName(this.name);
    }
    static async getCollection() {
        if (!this.$database) {
            throw new Error('Model should only be accessed from IoC container');
        }
        const collectionName = this._computeCollectionName();
        const connection = this.$database.connection();
        return connection.collection(collectionName);
    }
    static async create(value, options) {
        const collection = await this.getCollection();
        const instance = new this(value, {
            collection,
            session: options === null || options === void 0 ? void 0 : options.session,
        });
        await instance.save(options);
        return instance;
    }
    static async findOne(filter, options) {
        const collection = await this.getCollection();
        const result = await collection.findOne(filter, options);
        if (result === null)
            return null;
        return new this(result, { collection, session: options === null || options === void 0 ? void 0 : options.session }, true);
    }
    static async find(filter, options) {
        const collection = await this.getCollection();
        const cursor = collection.find(filter, options);
        return new FindResult(filter, options, cursor, collection, this);
    }
    static async findById(id, options) {
        const collection = await this.getCollection();
        const result = await collection.findOne({ _id: id }, options);
        if (result === null)
            return null;
        return new this(result, { collection, session: options === null || options === void 0 ? void 0 : options.session }, true);
    }
    static async findByIdOrThrow(id, options) {
        const collection = await this.getCollection();
        const result = await collection.findOne({ _id: id }, options);
        if (result === null) {
            throw new Error(`document ${String(id)} not found in ${this._computeCollectionName()}`);
        }
        return new this(result, { collection, session: options === null || options === void 0 ? void 0 : options.session }, true);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return {
            model: this.constructor.name,
            originalData: this.$originalData,
            currentData: this.$currentData,
            isDirty: this.isDirty,
        };
    }
    $dirty() {
        return lodash_1.pickBy(this.$currentData, (value, key) => {
            return (this.$originalData[key] === undefined ||
                !lodash_1.isEqual(this.$originalData[key], value));
        });
    }
    $ensureNotDeleted() {
        if (this.$isDeleted) {
            throw new Error('this entry was deleted from the database');
        }
    }
    async $ensureCollection() {
        if (!Model.$database) {
            throw new Error('Model should only be accessed from IoC container');
        }
        if (this.$collection !== null)
            return this.$collection;
        const connection = Model.$database.connection();
        this.$collection = await connection.collection(this.constructor._computeCollectionName());
        return this.$collection;
    }
    $prepareToSet() {
        const dirty = this.$dirty();
        const dirtyEntries = Object.entries(dirty);
        if (dirtyEntries.length === 0) {
            return null;
        }
        const toSet = {};
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
    get id() {
        return this.$currentData._id;
    }
    get isDirty() {
        return Object.keys(this.$dirty()).length > 0;
    }
    toJSON() {
        return this.$currentData;
    }
    async save(options) {
        var _a, _b;
        this.$ensureNotDeleted();
        const collection = await this.$ensureCollection();
        if (this.$alreadySaved === false) {
            await this.callHooks('beforeCreate');
        }
        else {
            await this.callHooks('beforeUpdate');
        }
        const toSet = this.$prepareToSet();
        if (toSet === null)
            return false;
        if (this.$alreadySaved === false) {
            const result = await collection.insertOne(toSet, {
                session: (_a = this.$options) === null || _a === void 0 ? void 0 : _a.session,
                ...options,
            });
            this.$currentData._id = result.insertedId;
        }
        else {
            await collection.updateOne({ _id: this.$currentData._id }, { $set: toSet }, { session: (_b = this.$options) === null || _b === void 0 ? void 0 : _b.session, ...options });
        }
        this.$originalData = lodash_1.cloneDeep(this.$currentData);
        if (this.$alreadySaved === false) {
            this.$alreadySaved = true;
            await this.callHooks('afterCreate');
        }
        else {
            await this.callHooks('afterUpdate');
        }
        return true;
    }
    async delete(options) {
        this.$ensureNotDeleted();
        const collection = await this.$ensureCollection();
        const result = await collection.deleteOne({
            _id: this.$currentData._id,
        }, { session: this.$options.session, ...options });
        this.$isDeleted = true;
        return result.deletedCount === 1;
    }
    merge(values) {
        Object.entries(values).forEach(([key, value]) => {
            this.$currentData[key] = value;
        });
        return this;
    }
    fill(values) {
        const createdAt = this.$currentData.createdAt;
        this.$currentData = {
            _id: this.id,
        };
        if (createdAt)
            this.$currentData.createdAt = createdAt;
        return this.merge(values);
    }
    static addHook(name, target, propertyName, descriptor) {
        var _a, _b, _c, _d;
        if (descriptor.value === undefined) {
            throw new utils_1.Exception('Undefined descriptor value is not allowed');
        }
        const targetType = target.constructor;
        if (!Model.$hooks.has(name)) {
            Model.$hooks.set(name, new Map());
        }
        if (!((_a = Model.$hooks.get(name)) === null || _a === void 0 ? void 0 : _a.has(targetType))) {
            (_b = Model.$hooks.get(name)) === null || _b === void 0 ? void 0 : _b.set(targetType, []);
        }
        (_d = (_c = Model.$hooks.get(name)) === null || _c === void 0 ? void 0 : _c.get(targetType)) === null || _d === void 0 ? void 0 : _d.push(descriptor.value);
    }
    async callHooks(name, ...args) {
        var _a, _b;
        for (let type of ((_a = Model.$hooks.get(name)) === null || _a === void 0 ? void 0 : _a.keys()) || []) {
            if (this instanceof type) {
                for (let trigger of ((_b = Model.$hooks.get(name)) === null || _b === void 0 ? void 0 : _b.get(type)) || []) {
                    await trigger.apply(this, args);
                }
            }
        }
    }
}
exports.Model = Model;
Model.$hooks = new Map();
class AutoIncrementModel extends Model {
    constructor(dbObj, options) {
        super(dbObj, options);
    }
    async save(options) {
        var _a, _b;
        this.$ensureNotDeleted();
        const collection = await this.$ensureCollection();
        const toSet = this.$prepareToSet();
        if (toSet === null)
            return false;
        if (this.id === undefined) {
            const connection = AutoIncrementModel.$database.connection();
            const counterCollection = await connection.collection('__adonis_mongodb_counters');
            const doc = await counterCollection.findOneAndUpdate({ _id: computeCollectionName(this.constructor.name) }, { $inc: { count: 1 } }, { session: options === null || options === void 0 ? void 0 : options.session, upsert: true });
            const newCount = doc.value ? doc.value.count + 1 : 1;
            toSet._id = newCount;
            await collection.insertOne(toSet, {
                session: (_a = this.$options) === null || _a === void 0 ? void 0 : _a.session,
                ...options,
            });
            this.$currentData._id = newCount;
        }
        else {
            await this.$collection.updateOne({ _id: this.$currentData._id }, { $set: toSet }, { session: (_b = this.$options) === null || _b === void 0 ? void 0 : _b.session, ...options });
        }
        this.$originalData = lodash_1.cloneDeep(this.$currentData);
        return true;
    }
}
exports.AutoIncrementModel = AutoIncrementModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWwvTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkNBQTRDO0FBQzVDLG1DQUErRDtBQVcvRCwwREFBa0M7QUFJbEMsaURBQThDO0FBK0I5QyxNQUFNLFVBQVU7SUFPZCxZQUNFLE1BQXNCLEVBQ3RCLE9BQXNDLEVBQ3RDLE1BQWlCLEVBQ2pCLFVBQXlCLEVBQ3pCLFdBQWdDO1FBRWhDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRztRQUNkLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQ2YsQ0FBQyxLQUFLLEVBQUUsRUFBRTs7WUFDUixPQUFBLElBQUksSUFBSSxDQUFDLFlBQVksQ0FDbkIsS0FBSyxFQUNMO2dCQUNFLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDNUIsT0FBTyxFQUFFLE1BQUEsSUFBSSxDQUFDLFFBQVEsMENBQUUsT0FBTzthQUNoQyxFQUNELElBQUksQ0FDTCxDQUFBO1NBQUEsQ0FDSixDQUFDO0lBQ0osQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLO1FBQ2hCLE1BQU0sT0FBTyxHQUNYLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUztZQUN6QixDQUFDLENBQUM7Z0JBQ0UsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSztnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxR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