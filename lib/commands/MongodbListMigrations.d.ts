import { Mongodb } from '../src/Mongodb';
import MigrationCommand from './util/MigrationCommand';
export default class MongodbListMigrations extends MigrationCommand {
    static commandName: string;
    static description: string;
    static settings: {
        loadApp: boolean;
    };
    run(db: Mongodb): Promise<void>;
}
