import { Db, Collection, ClientSession } from 'mongodb';
import { LoggerContract } from '@ioc:Adonis/Core/Logger';
import { MongodbConnectionConfig, ConnectionContract } from '@ioc:Mongodb/Database';
export declare class Connection implements ConnectionContract {
    private $name;
    private $logger;
    private $status;
    private $client;
    private $connectPromise;
    config: MongodbConnectionConfig;
    constructor(name: string, config: MongodbConnectionConfig, logger: LoggerContract);
    private _ensureDb;
    connect(): void;
    close(): Promise<void>;
    database(): Promise<Db>;
    collection<TSchema = unknown>(collectionName: string): Promise<Collection<TSchema>>;
    transaction<TResult>(handler: (session: ClientSession, db: Db) => Promise<TResult>): Promise<TResult>;
}
