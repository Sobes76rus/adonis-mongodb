import { BaseCommand } from '@adonisjs/core/build/standalone';
import { MongodbContract } from '@ioc:Mongodb/Database';
export default class MongodbEnsureIndexes extends BaseCommand {
    static commandName: string;
    static description: string;
    static settings: {
        loadApp: boolean;
    };
    connection: string;
    run(db: MongodbContract): Promise<void>;
}
