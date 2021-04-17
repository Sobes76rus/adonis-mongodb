import { Mongodb } from '../src/Mongodb';
import MigrationCommand from './util/MigrationCommand';
export default class MongodbMigrate extends MigrationCommand {
    static commandName: string;
    static description: string;
    static settings: {
        loadApp: boolean;
    };
    private _executeMigration;
    run(db: Mongodb): Promise<void>;
}
