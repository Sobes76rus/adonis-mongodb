"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const MongodbModelAuthProvider_1 = require("../src/Auth/MongodbModelAuthProvider");
const Migration_1 = __importDefault(require("../src/Migration"));
const Model_1 = require("../src/Model/Model");
const Mongodb_1 = require("../src/Mongodb");
const Hooks = __importStar(require("../src/Model/Hooks"));
class MongodbProvider {
    constructor(app) {
        this.app = {
            container: app,
            config: app.use('Adonis/Core/Config'),
        };
    }
    register() {
        this.app.container.singleton('Mongodb/Database', () => {
            return new Mongodb_1.Mongodb(this.app.config.get('mongodb', {}), this.app.logger);
        });
        this.app.container.singleton('Mongodb/Model', () => {
            Model_1.Model.$setDatabase(this.app.container.use('Mongodb/Database'));
            Model_1.AutoIncrementModel.$setDatabase(this.app.container.use('Mongodb/Database'));
            return { Model: Model_1.Model, AutoIncrementModel: Model_1.AutoIncrementModel, register: Model_1.register };
        });
        this.app.container.singleton('Mongodb/Hooks', () => Hooks);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYlByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vcHJvdmlkZXJzL01vbmdvZGJQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFLbkMsbUZBQW1GO0FBQ25GLGlFQUErQztBQUMvQyw4Q0FBeUU7QUFDekUsNENBQXlDO0FBQ3pDLDBEQUE0QztBQUU1QyxNQUFxQixlQUFlO0lBRWxDLFlBQW1CLEdBQWdCO1FBQ2pDLElBQUksQ0FBQyxHQUFHLEdBQUc7WUFDVCxTQUFTLEVBQUUsR0FBRztZQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO1NBQ3RDLENBQUM7SUFDSixDQUFDO0lBRU0sUUFBUTtRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDcEQsT0FBTyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7WUFDakQsYUFBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQy9ELDBCQUFrQixDQUFDLFlBQVksQ0FDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQzNDLENBQUM7WUFFRixPQUFPLEVBQUUsS0FBSyxFQUFMLGFBQUssRUFBRSxrQkFBa0IsRUFBbEIsMEJBQWtCLEVBQUUsUUFBUSxFQUFSLGdCQUFRLEVBQUUsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUNyRCxPQUFPLG1CQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxrQkFBUSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLElBQUk7UUFDVCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQ3ZELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxzREFBMkIsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRO1FBQ25CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzVELE9BQU8sUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVNLEtBQUs7UUFDVixlQUFlO0lBQ2pCLENBQUM7Q0FDRjtBQTVDRCxrQ0E0Q0MifQ==