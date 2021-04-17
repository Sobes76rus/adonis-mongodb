"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const MongodbModelAuthProvider_1 = require("../src/Auth/MongodbModelAuthProvider");
const Migration_1 = __importDefault(require("../src/Migration"));
const Model_1 = require("../src/Model/Model");
const Mongodb_1 = require("../src/Mongodb");
class MongodbProvider {
    constructor(app) {
        this.app = {
            container: app,
            config: app.use('Adonis/Core/Config')
        };
    }
    register() {
        this.app.container.singleton('Mongodb/Database', () => {
            return new Mongodb_1.Mongodb(this.app.config.get('mongodb', {}), this.app.logger);
        });
        this.app.container.singleton('Mongodb/Model', () => {
            Model_1.Model.$setDatabase(this.app.container.use('Mongodb/Database'));
            Model_1.AutoIncrementModel.$setDatabase(this.app.container.use('Mongodb/Database'));
            return { Model: Model_1.Model, AutoIncrementModel: Model_1.AutoIncrementModel };
        });
        this.app.container.singleton('Mongodb/Migration', () => {
            return Migration_1.default(this.app.container.use('Mongodb/Database'));
        });
        this.app.container.bind('Mongodb/ObjectId', () => mongodb_1.ObjectId);
    }
    boot() {
        if (this.app.container.hasBinding('Adonis/Addons/Auth')) {
            const Auth = this.app.container.use('Adonis/Addons/Auth');
            Auth.extend('provider', 'mongodb-model', MongodbModelAuthProvider_1.getMongodbModelAuthProvider);
        }
    }
    async shutdown() {
        const Database = this.app.container.use('Mongodb/Database');
        return Database.closeConnections();
    }
    ready() {
        // App is ready
    }
}
exports.default = MongodbProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYlByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vcHJvdmlkZXJzL01vbmdvZGJQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFDQUFtQztBQUtuQyxtRkFBbUY7QUFDbkYsaUVBQStDO0FBQy9DLDhDQUErRDtBQUMvRCw0Q0FBeUM7QUFFekMsTUFBcUIsZUFBZTtJQUVsQyxZQUFtQixHQUFnQjtRQUNqQyxJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1QsU0FBUyxFQUFFLEdBQUc7WUFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztTQUN0QyxDQUFDO0lBQ0osQ0FBQztJQUVNLFFBQVE7UUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQ3BELE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1lBQ2pELGFBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUMvRCwwQkFBa0IsQ0FBQyxZQUFZLENBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUMzQyxDQUFDO1lBRUYsT0FBTyxFQUFFLEtBQUssRUFBTCxhQUFLLEVBQUUsa0JBQWtCLEVBQWxCLDBCQUFrQixFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1lBQ3JELE9BQU8sbUJBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLGtCQUFRLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU0sSUFBSTtRQUNULElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7WUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLHNEQUEyQixDQUFDLENBQUM7U0FDdkU7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVE7UUFDbkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDNUQsT0FBTyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRU0sS0FBSztRQUNWLGVBQWU7SUFDakIsQ0FBQztDQUNGO0FBM0NELGtDQTJDQyJ9