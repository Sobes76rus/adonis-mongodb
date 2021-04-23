import { BaseCommand } from '@adonisjs/core/build/standalone';
export default class MongodbMakeModel extends BaseCommand {
    static commandName: string;
    static description: string;
    static settings: {
        loadApp: boolean;
    };
    name: string;
    run(): Promise<void>;
}
