/// <reference types="@adonisjs/auth" />
/// <reference types="@adonisjs/hash/build/adonis-typings" />
import { Application } from '@adonisjs/core/build/standalone';
import { ProviderUserContract, UserProviderContract } from '@ioc:Adonis/Addons/Auth';
import { HashContract } from '@ioc:Adonis/Core/Hash';
import { Model, ModelConstructor, MongodbModelAuthProviderConfig } from '@ioc:Mongodb/Model';
declare class MongodbModelAuthProviderUser implements ProviderUserContract<Model<unknown>> {
    user: any;
    private identifierKey;
    private identifierKeyType;
    private hash;
    constructor(user: any, identifierKey: string, identifierKeyType: 'objectid' | 'string' | 'number', hash: HashContract);
    getId(): string | number | null;
    verifyPassword(plainPassword: string): Promise<boolean>;
    getRememberMeToken(): string | null;
    setRememberMeToken(): void;
}
declare class MongodbModelAuthUserProvider implements UserProviderContract<Model<unknown>> {
    private app;
    private config;
    private uids;
    private identifierKey;
    private identifierKeyType;
    private hash;
    constructor(app: Application, config: MongodbModelAuthProviderConfig<ModelConstructor<unknown>>);
    private getModel;
    getUserFor(user: Model): MongodbModelAuthProviderUser;
    findById(id: string | number): Promise<MongodbModelAuthProviderUser>;
    findByUid(uid: string | number): Promise<MongodbModelAuthProviderUser>;
    findByRememberMeToken(): Promise<MongodbModelAuthProviderUser>;
    updateRememberMeToken(): Promise<void>;
}
export declare function getMongodbModelAuthProvider(application: Application, config: MongodbModelAuthProviderConfig<ModelConstructor<unknown>>): MongodbModelAuthUserProvider;
export {};
