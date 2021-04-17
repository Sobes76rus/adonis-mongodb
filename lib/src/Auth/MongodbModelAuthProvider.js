"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongodbModelAuthProvider = void 0;
const utils_1 = require("@poppinss/utils");
const mongodb_1 = require("mongodb");
class MongodbModelAuthProviderUser {
    constructor(
    // `this.user` can be any Model, so we use `any` to avoid indexing issues later.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user, identifierKey, identifierKeyType, hash) {
        this.user = user;
        this.identifierKey = identifierKey;
        this.identifierKeyType = identifierKeyType;
        this.hash = hash;
    }
    getId() {
        if (this.user === null)
            return null;
        const value = this.user[this.identifierKey];
        if (this.identifierKeyType === 'objectid') {
            return value.toString();
        }
        return value;
    }
    verifyPassword(plainPassword) {
        if (this.user === null) {
            throw new Error('Cannot "verifyPassword for non-existing user');
        }
        if (!this.user.password) {
            throw new Error('Auth user object must have a password in order to call "verifyPassword"');
        }
        return this.hash.verify(this.user.password, plainPassword);
    }
    getRememberMeToken() {
        return null;
    }
    setRememberMeToken() {
        throw new Error('unimplemented setRememberMeToken');
    }
}
class MongodbModelAuthUserProvider {
    constructor(app, config) {
        this.app = app;
        this.config = config;
        this.uids = ['email'];
        this.identifierKey = '_id';
        this.identifierKeyType = 'objectid';
        if (config.uids) {
            if (config.uids.length === 0) {
                throw new Error('config.uids must have at least one element');
            }
            this.uids = config.uids;
        }
        if (config.identifierKey) {
            this.identifierKey = config.identifierKey;
        }
        if (config.identifierKeyType) {
            this.identifierKeyType = config.identifierKeyType;
        }
        const Hash = app.container.use('Adonis/Core/Hash');
        // @ts-expect-error For some reason, BcryptDriver is not compatible with HashDriver.
        this.hash = config.hashDriver ? Hash.use(config.hashDriver) : Hash;
    }
    async getModel() {
        if (this.config.model) {
            return utils_1.esmResolver(await this.config.model());
        }
        else {
            return utils_1.esmResolver(await this.app.container.use('App/Models/User'));
        }
    }
    getUserFor(user) {
        return new MongodbModelAuthProviderUser(user, this.identifierKey, this.identifierKeyType, this.hash);
    }
    async findById(id) {
        const Model = await this.getModel();
        const user = await Model.findOne({
            [this.identifierKey]: this.identifierKeyType === 'objectid' ? new mongodb_1.ObjectId(id) : id,
        });
        return new MongodbModelAuthProviderUser(user, this.identifierKey, this.identifierKeyType, this.hash);
    }
    async findByUid(uid) {
        const Model = await this.getModel();
        const $or = this.uids.map((uidKey) => ({ [uidKey]: uid }));
        const user = await Model.findOne({ $or });
        return new MongodbModelAuthProviderUser(user, this.identifierKey, this.identifierKeyType, this.hash);
    }
    async findByRememberMeToken( /* userId: string | number, token: string */) {
        throw new Error('unimplemented findByRememberMeToken');
        // return new MongodbModelAuthProviderUser(null);
    }
    updateRememberMeToken( /* authenticatable: MongodbModelAuthProviderUser */) {
        throw new Error('unimplemented updateRememberMeToken');
    }
}
function getMongodbModelAuthProvider(application, config) {
    return new MongodbModelAuthUserProvider(application, config);
}
exports.getMongodbModelAuthProvider = getMongodbModelAuthProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYk1vZGVsQXV0aFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0F1dGgvTW9uZ29kYk1vZGVsQXV0aFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDJDQUE4QztBQUM5QyxxQ0FBbUM7QUFhbkMsTUFBTSw0QkFBNEI7SUFFaEM7SUFDRSxnRkFBZ0Y7SUFDaEYsOERBQThEO0lBQ3ZELElBQVMsRUFDUixhQUFxQixFQUNyQixpQkFBbUQsRUFDbkQsSUFBa0I7UUFIbkIsU0FBSSxHQUFKLElBQUksQ0FBSztRQUNSLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQ3JCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0M7UUFDbkQsU0FBSSxHQUFKLElBQUksQ0FBYztJQUN6QixDQUFDO0lBRUcsS0FBSztRQUNWLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO1lBQ3pDLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU0sY0FBYyxDQUFDLGFBQXFCO1FBQ3pDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IseUVBQXlFLENBQzFFLENBQUM7U0FDSDtRQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUks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