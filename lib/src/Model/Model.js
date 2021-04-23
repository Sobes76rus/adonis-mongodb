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
    constructor(dbObj, options) {
        super(dbObj, options);
    }
    async save(options) {
        var _a, _b;
        this.$ensureNotDeleted();
        const collection = await this.$ensureCollection();
        const created = this.id === undefined;
        if (this.id === undefined) {
            await this.callHooks('beforeCreate');
        }
        else {
            await this.callHooks('beforeUpdate');
        }
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
        if (created) {
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