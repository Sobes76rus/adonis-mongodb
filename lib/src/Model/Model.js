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