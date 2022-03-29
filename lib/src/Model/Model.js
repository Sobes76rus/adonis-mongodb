"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIndex = exports.register = exports.AutoIncrementModel = exports.Model = void 0;
const utils_1 = require("@poppinss/utils");
const lodash_1 = __importStar(require("lodash"));
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
            }, true);
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
        }, false);
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
        if (dirtyEntries.length === 0 && this.$alreadySaved) {
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
        await this.callHooks('beforeDelete');
        const collection = await this.$ensureCollection();
        const result = await collection.deleteOne({
            _id: this.$currentData._id,
        }, { session: this.$options.session, ...options });
        this.$isDeleted = true;
        await this.callHooks('afterDelete');
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
        var _a, _b, _c, _d;
        for (let type of (_b = (_a = Model.$hooks.get(name)) === null || _a === void 0 ? void 0 : _a.keys()) !== null && _b !== void 0 ? _b : []) {
            if (this instanceof type) {
                for (let trigger of (_d = (_c = Model.$hooks.get(name)) === null || _c === void 0 ? void 0 : _c.get(type)) !== null && _d !== void 0 ? _d : []) {
                    await trigger.apply(this, args);
                }
            }
        }
    }
    static prepareIndexes(target) {
        var _a, _b, _c;
        let cls = target;
        let obj = [];
        while (cls) {
            for (let index of (_b = (_a = cls.$indexes) === null || _a === void 0 ? void 0 : _a.reverse()) !== null && _b !== void 0 ? _b : []) {
                obj.push(parseIndex(index));
            }
            cls = (_c = Object.getPrototypeOf(cls.prototype)) === null || _c === void 0 ? void 0 : _c.constructor;
        }
        return obj.reverse();
    }
}
exports.Model = Model;
Model.$hooks = new Map();
Model.$allModels = [];
class AutoIncrementModel extends Model {
    constructor(dbObj, options, alreadyExists = false) {
        super(dbObj, options, alreadyExists);
    }
    async save(options) {
        var _a, _b, _c, _d;
        this.$ensureNotDeleted();
        const collection = await this.$ensureCollection();
        if (this.$alreadySaved === false) {
            await this.callHooks('beforeCreate');
        }
        else {
            await this.callHooks('beforeUpdate');
        }
        const toSet = (_a = this.$prepareToSet()) !== null && _a !== void 0 ? _a : {};
        if (toSet === null)
            return false;
        if (this.$alreadySaved === false) {
            const connection = AutoIncrementModel.$database.connection();
            const counterCollection = await connection.collection('__adonis_mongodb_counters');
            const doc = await counterCollection.findOneAndUpdate({ _id: computeCollectionName(this.constructor.name) }, { $inc: { count: 1 } }, { session: options === null || options === void 0 ? void 0 : options.session, upsert: true });
            const newCount = (_b = toSet._id) !== null && _b !== void 0 ? _b : (doc.value ? doc.value.count + 1 : 1);
            toSet._id = newCount;
            await collection.insertOne(toSet, {
                session: (_c = this.$options) === null || _c === void 0 ? void 0 : _c.session,
                ...options,
            });
            this.$currentData._id = newCount;
        }
        else {
            await this.$collection.updateOne({ _id: this.$currentData._id }, { $set: toSet }, { session: (_d = this.$options) === null || _d === void 0 ? void 0 : _d.session, ...options });
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
}
exports.AutoIncrementModel = AutoIncrementModel;
function register(target) {
    Model.$allModels.push(target);
}
exports.register = register;
function parseIndex(index) {
    if (lodash_1.default.isString(index)) {
        const [keys, ...opts] = index.split(':');
        return {
            keys: lodash_1.default.reduce(keys.split(','), (obj, key) => {
                const c = key[0];
                key = key.substr(1);
                let ind = 1;
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
            }, {}),
            opts: lodash_1.default.reduce(opts, (obj, key) => {
                switch (key) {
                    case 'unique':
                        // @ts-ignore
                        obj.unique = true;
                        break;
                    default:
                        throw new Error(`Undefined index option: ${index}`);
                }
                return obj;
            }, {}),
        };
    }
    if (lodash_1.default.has(index, 'keys') && lodash_1.default.has(index, 'opts')) {
        return index;
    }
    throw new Error(`Invalid index: ${index}`);
}
exports.parseIndex = parseIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWwvTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUE0QztBQUM1QyxpREFBa0U7QUFXbEUsMERBQWtDO0FBSWxDLGlEQUE4QztBQStCOUMsTUFBTSxVQUFVO0lBT2QsWUFDRSxNQUFzQixFQUN0QixPQUFzQyxFQUN0QyxNQUFpQixFQUNqQixVQUF5QixFQUN6QixXQUFnQztRQUVoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNsQyxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUc7UUFDZCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUMsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUNmLENBQUMsS0FBSyxFQUFFLEVBQUU7O1lBQ1IsT0FBQSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQ25CLEtBQUssRUFDTDtnQkFDRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzVCLE9BQU8sRUFBRSxNQUFBLElBQUksQ0FBQyxRQUFRLDBDQUFFLE9BQU87YUFDaEMsRUFDRCxJQUFJLENBQ0wsQ0FBQTtTQUFBLENBQ0osQ0FBQztJQUNKLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSztRQUNoQixNQUFNLE9BQU8sR0FDWCxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVM7WUFDekIsQ0FBQyxDQUFDO2dCQUNFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7Z0JBQzFCLFNB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