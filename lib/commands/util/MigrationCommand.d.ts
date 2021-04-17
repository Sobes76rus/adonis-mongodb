import { BaseCommand } from '@adonisjs/core/build/standalone';
import { Logger } from '@poppinss/cliui/build/src/Logger';
import { ClientSession } from 'mongodb';
import { MongodbConnectionConfig } from '@ioc:Mongodb/Database';
import BaseMigration from '@ioc:Mongodb/Migration';
import { MigrationDescription } from './transformMigrations';
export declare const migrationCollectionName = "__adonis_mongodb";
export declare const migrationLockCollectionName = "__adonis_mongodb_lock";
interface MigrationModule {
    default: new (connection: string | undefined, logger: Logger, session: ClientSession) => BaseMigration;
    description?: string;
}
export default abstract class MigrationCommand extends BaseCommand {
    static settings: {
        loadApp: boolean;
    };
    static commandName: string;
    static description: string;
    connection: string;
    protected getMigrations(config: MongodbConnectionConfig): Promise<MigrationDescription[]>;
    protected importMigration(file: string): Promise<{
        Migration: MigrationModule['default'];
        description?: string;
    }>;
}
export {};
