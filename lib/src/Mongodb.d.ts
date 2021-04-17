import { LoggerContract } from '@ioc:Adonis/Core/Logger';
import { MongodbContract, MongodbConfig } from '@ioc:Mongodb/Database';
import { Connection } from './Connection';
export declare class Mongodb implements MongodbContract {
    private $config;
    private $logger;
    private $connections;
    private $defaultConnectionName;
    constructor(config: MongodbConfig, logger: LoggerContract);
    private _registerConnections;
    hasConnection(connectionName: string): boolean;
    connection(connectionName?: string): Connection;
    closeConnections(): Promise<void>;
}
