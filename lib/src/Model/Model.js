"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoIncrementModel = exports.Model = void 0;
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
        this.$alreadySaved = true;
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
}
exports.Model = Model;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWwvTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbUNBQStEO0FBVy9ELDBEQUFrQztBQUlsQyxpREFBOEM7QUErQjlDLE1BQU0sVUFBVTtJQU9kLFlBQ0UsTUFBc0IsRUFDdEIsT0FBc0MsRUFDdEMsTUFBaUIsRUFDakIsVUFBeUIsRUFDekIsV0FBZ0M7UUFFaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDbEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHO1FBQ2QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FDZixDQUFDLEtBQUssRUFBRSxFQUFFOztZQUNSLE9BQUEsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUNuQixLQUFLLEVBQ0w7Z0JBQ0UsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM1QixPQUFPLEVBQUUsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxPQUFPO2FBQ2hDLEVBQ0QsSUFBSSxDQUNMLENBQUE7U0FBQSxDQUNKLENBQUM7SUFDSixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQUs7UUFDaEIsTUFBTSxPQUFPLEdBQ1gsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTO1lBQ3pCLENBQUMsQ0FBQztnQkFDRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO2dCQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO2dCQUNsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjO2dCQUM1QyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2dCQUM5QixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO2FBQ3pCO1lBQ0gsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVNLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQzs7UUFDbEMsSUFBSSxLQUFLLEVBQUUsTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN0QyxNQUFNLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2pDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDNUIsT0FBTyxFQUFFLE1BQUEsSUFBSSxDQUFDLFFBQVEsMENBQUUsT0FBTzthQUNoQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FDRjtBQUVELFNBQVMscUJBQXFCLENBQUMsZUFBdUI7SUFDcEQsT0FBTyxrQkFBUyxDQUFDLG1CQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQsTUFBYSxLQUFLO0lBZWhCLFlBQ0UsS0FBK0IsRUFDL0IsT0FBdUIsRUFDdkIsYUFBYSxHQUFHLEtBQUs7UUFWYixnQkFBVyxHQUFzQixJQUFJLENBQUM7UUFZOUMsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLGtCQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztTQUMzQjthQUFNO1lBQ0wsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7U0FDeEI7UUFFRCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQ3ZDO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsaURBQWlEO1FBQ2pELE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLDJCQUFZLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFpQjtRQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBRU0sTUFBTSxDQUFDLHNCQUFzQjtRQUNsQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYTtRQUcvQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDckU7UUFDRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNyRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQy9DLE9BQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBRXhCLEtBQ3lCLEVBQ3pCLE9BQW9DO1FBRXBDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUMvQixVQUFVO1lBQ1YsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPO1NBQzFCLENBQUMsQ0FBQztRQUNILE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBRXpCLE1BQXNCLEVBQ3RCLE9BQXNEO1FBRXRELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzlDLE1BQU0sTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLE9BQU8sQ0FDckMsTUFBTSxFQUNOLE9BQWtDLENBQ25DLENBQUM7UUFDRixJQUFJLE1BQU0sS0FBSyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDakMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBRXRCLE1BQXNCLEVBQ3RCLE9BQXNEO1FBRXRELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzlDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQWtDLENBQUMsQ0FBQztRQUMzRSxPQUFPLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBRTFCLEVBQVcsRUFDWCxPQUFzRDtRQUV0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxPQUFPLENBQ3JDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUNYLE9BQWtDLENBQ25DLENBQUM7UUFDRixJQUFJLE1BQU0sS0FBSyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDakMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBRWpDLEVBQVcsRUFDWCxPQUFzRDtRQUV0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxPQUFPLENBQ3JDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUNYLE9BQWtDLENBQ25DLENBQUM7UUFDRixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDYixZQUFZLE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQ3ZFLENBQUM7U0FDSDtRQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ2xELE9BQU87WUFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO1lBQzVCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNoQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDOUIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3RCLENBQUM7SUFDSixDQUFDO0lBRVMsTUFBTTtRQUNkLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDOUMsT0FBTyxDQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUztnQkFDckMsQ0FBQyxnQkFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQ3pDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFUyxpQkFBaUI7UUFDekIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztTQUM3RDtJQUNILENBQUM7SUFFUyxLQUFLLENBQUMsaUJBQWlCO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztTQUNyRTtRQUNELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRXZELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQzNDLElBQUksQ0FBQyxXQUE0QixDQUFDLHNCQUFzQixFQUFFLENBQzVELENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUVTLGFBQWE7UUFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3QixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsTUFBTSxLQUFLLEdBQStCLEVBQUUsQ0FBQztRQUM3QyxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztZQUNsQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztTQUN2QjtRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNsQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUV0QixLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksWUFBWSxFQUFFO1lBQ2pELEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLENBQUM7U0FDOUI7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFXLEVBQUU7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBMEI7O1FBQzFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFbEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25DLElBQUksS0FBSyxLQUFLLElBQUk7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssS0FBSyxFQUFFO1lBQ2hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQy9DLE9BQU8sRUFBRSxNQUFBLElBQUksQ0FBQyxRQUFRLDBDQUFFLE9BQU87Z0JBQy9CLEdBQUcsT0FBTzthQUNYLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7U0FDM0M7YUFBTTtZQUNMLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FDeEIsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsRUFDOUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQ2YsRUFBRSxPQUFPLEVBQUUsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FDaEQsQ0FBQztTQUNIO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxrQkFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQXVCO1FBQ3pDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUN2QztZQUNFLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUc7U0FDM0IsRUFDRCxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUMvQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sS0FBSyxDQUdWLE1BR0M7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTSxJQUFJLENBR1QsTUFHQztRQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO1FBQzlDLElBQUksQ0FBQyxZQUFZLEdBQUc7WUFDbEIsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFO1NBQ2IsQ0FBQztRQUNGLElBQUksU0FBUztZQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUN2RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBN1FELHNCQTZRQztBQUVELE1BQWEsa0JBQW1CLFNBQVEsS0FBSztJQUMzQyxZQUFtQixLQUErQixFQUFFLE9BQXVCO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBMEI7O1FBQzFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFbEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25DLElBQUksS0FBSyxLQUFLLElBQUk7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVqQyxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFO1lBQ3pCLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM3RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FDbkQsMkJBQTJCLENBQzVCLENBQUM7WUFFRixNQUFNLEdBQUcsR0FBRyxNQUFNLGlCQUFpQixDQUFDLGdCQUFnQixDQUNsRCxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ3JELEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQ3RCLEVBQUUsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUM1QyxDQUFDO1lBQ0YsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFDckIsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtnQkFDaEMsT0FBTyxFQUFFLE1BQUEsSUFBSSxDQUFDLFFBQVEsMENBQUUsT0FBTztnQkFDL0IsR0FBRyxPQUFPO2FBQ1gsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO1NBQ2xDO2FBQU07WUFDTCxNQUFPLElBQUksQ0FBQyxXQUEwQixDQUFDLFNBQVMsQ0FDOUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsRUFDOUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQ2YsRUFBRSxPQUFPLEVBQUUsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FDaEQsQ0FBQztTQUNIO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxrQkFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQXhDRCxnREF3Q0MifQ==