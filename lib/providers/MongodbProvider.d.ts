import { IocContract } from '@adonisjs/fold';
export default class MongodbProvider {
    private app;
    constructor(app: IocContract);
    register(): void;
    boot(): void;
    shutdown(): Promise<void>;
    ready(): void;
}
