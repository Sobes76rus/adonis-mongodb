import { BaseCommand } from '@adonisjs/core/build/standalone';
import { MongodbContract } from '@ioc:Mongodb/Database';
import { AutoIncrementModel, Model } from '@ioc:Mongodb/Model';
export default class MongodbEnsureIndexes extends BaseCommand {
    static commandName: string;
    static description: string;
    static settings: {
        loadApp: boolean;
    };
    connection: string;
    run(db: MongodbContract, ModelNS: any, _: typeof Model[] | typeof AutoIncrementModel[]): Promise<void>;
}
