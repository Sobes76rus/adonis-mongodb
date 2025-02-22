import { Application } from '@adonisjs/core/build/standalone';
import { esmResolver } from '@poppinss/utils';
import { ObjectId } from 'mongodb';

import {
  ProviderUserContract,
  UserProviderContract,
} from '@ioc:Adonis/Addons/Auth';
import { HashContract } from '@ioc:Adonis/Core/Hash';
import {
  Model,
  ModelConstructor,
  MongodbModelAuthProviderConfig,
} from '@ioc:Mongodb/Model';

class MongodbModelAuthProviderUser
  implements ProviderUserContract<Model<unknown>> {
  public constructor(
    // `this.user` can be any Model, so we use `any` to avoid indexing issues later.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public user: any,
    private identifierKey: string,
    private identifierKeyType: 'objectid' | 'string' | 'number',
    private hash: HashContract,
  ) {}

  public getId(): string | number | null {
    if (this.user === null) return null;
    const value = this.user[this.identifierKey];
    if (this.identifierKeyType === 'objectid') {
      return value.toString();
    }
    return value;
  }

  public verifyPassword(plainPassword: string): Promise<boolean> {
    if (this.user === null) {
      throw new Error('Cannot "verifyPassword for non-existing user');
    }
    if (!this.user.password) {
      throw new Error(
        'Auth user object must have a password in order to call "verifyPassword"',
      );
    }

    return this.hash.verify(this.user.password, plainPassword);
  }

  public getRememberMeToken(): string | null {
    return null;
  }
  public setRememberMeToken(): void {
    throw new Error('unimplemented setRememberMeToken');
  }
}

class MongodbModelAuthUserProvider
  implements UserProviderContract<Model<unknown>> {
  private uids = ['email'];
  private identifierKey = '_id';
  private identifierKeyType: 'objectid' | 'string' | 'number' = 'objectid';
  private hash: HashContract;

  public constructor(
    private app: Application,
    private config: MongodbModelAuthProviderConfig<ModelConstructor<unknown>>,
  ) {
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

  private async getModel(): Promise<ModelConstructor<unknown>> {
    if (this.config.model) {
      return esmResolver(await this.config.model());
    } else {
      return esmResolver(await this.app.container.use('App/Models/User'));
    }
  }

  public getUserFor(user: Model): MongodbModelAuthProviderUser {
    return new MongodbModelAuthProviderUser(
      user,
      this.identifierKey,
      this.identifierKeyType,
      this.hash,
    );
  }

  public async findById(
    id: string | number,
  ): Promise<MongodbModelAuthProviderUser> {
    const Model = await this.getModel();
    const user = await Model.findOne({
      [this.identifierKey]:
        this.identifierKeyType === 'objectid' ? new ObjectId(id) : id,
    });
    return new MongodbModelAuthProviderUser(
      user,
      this.identifierKey,
      this.identifierKeyType,
      this.hash,
    );
  }

  public async findByUid(
    uid: string | number,
  ): Promise<MongodbModelAuthProviderUser> {
    const Model = await this.getModel();
    const $or = this.uids.map((uidKey) => ({ [uidKey]: uid }));
    const user = await Model.findOne({ $or });
    return new MongodbModelAuthProviderUser(
      user,
      this.identifierKey,
      this.identifierKeyType,
      this.hash,
    );
  }

  public async findByRememberMeToken(/* userId: string | number, token: string */): Promise<MongodbModelAuthProviderUser> {
    throw new Error('unimplemented findByRememberMeToken');
    // return new MongodbModelAuthProviderUser(null);
  }

  public updateRememberMeToken(/* authenticatable: MongodbModelAuthProviderUser */): Promise<void> {
    throw new Error('unimplemented updateRememberMeToken');
  }
}

export function getMongodbModelAuthProvider(
  application: Application,
  config: MongodbModelAuthProviderConfig<ModelConstructor<unknown>>,
) {
  return new MongodbModelAuthUserProvider(application, config);
}
