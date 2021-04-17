import { BaseCommand } from '@adonisjs/core/build/standalone';
import { MongodbContract } from '@ioc:Mongodb/Database';
export default class MongodbMakeMigration extends BaseCommand {
    static commandName: string;
    static description: string;
    static settings: {
        loadApp: boolean;
    };
    name: string;
    connection: string;
    run(db: MongodbContract): Promise<void>;
}
