"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const standalone_1 = require("@adonisjs/core/build/standalone");
const Model_1 = require("@ioc:Mongodb/Model");
class MongodbEnsureIndexes extends standalone_1.BaseCommand {
    async run(db) {
        if (this.connection && !db.hasConnection(this.connection)) {
            this.logger.error(`no MongoDB connection registered with name "${this.connection}"`);
            // @ts-ignore
            for (let model of Model_1.Model.$allModels) {
                const indexes = model.prepareIndexes(model);
                const collection = await Model_1.Model.getCollection();
                for (let index of indexes) {
                    // @ts-ignore
                    this.logger.info(`Create index on ${collection.name}`);
                    await collection.createIndex(index.keys, index.opts);
                }
            }
            process.exitCode = 1;
            return;
        }
    }
}
MongodbEnsureIndexes.commandName = 'mongodb:ensure-indexes';
MongodbEnsureIndexes.description = 'Ensure indexes';
MongodbEnsureIndexes.settings = {
    loadApp: true,
};
__decorate([
    standalone_1.flags.string({
        description: 'Database connection to use for the ensure indexes',
    }),
    __metadata("design:type", String)
], MongodbEnsureIndexes.prototype, "connection", void 0);
__decorate([
    standalone_1.inject(['Mongodb/Database', 'Mongodb/Model']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MongodbEnsureIndexes.prototype, "run", null);
exports.default = MongodbEnsureIndexes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYkVuc3VyZUluZGV4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jb21tYW5kcy9Nb25nb2RiRW5zdXJlSW5kZXhlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLGdFQUt5QztBQUd6Qyw4Q0FBMkM7QUFFM0MsTUFBcUIsb0JBQXFCLFNBQVEsd0JBQVc7SUFhcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFtQjtRQUNsQyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZiwrQ0FBK0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUNsRSxDQUFDO1lBRUYsYUFBYTtZQUNiLEtBQUssSUFBSSxLQUFLLElBQUksYUFBSyxDQUFDLFVBQVUsRUFBRTtnQkFDbEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBRS9DLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO29CQUN6QixhQUFhO29CQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDdkQsTUFBTSxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0RDthQUNGO1lBRUQsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDckIsT0FBTztTQUNSO0lBQ0gsQ0FBQzs7QUFqQ2EsZ0NBQVcsR0FBRyx3QkFBd0IsQ0FBQztBQUN2QyxnQ0FBVyxHQUFHLGdCQUFnQixDQUFDO0FBQy9CLDZCQUFRLEdBQUc7SUFDdkIsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBS0Y7SUFIQyxrQkFBSyxDQUFDLE1BQU0sQ0FBQztRQUNaLFdBQVcsRUFBRSxtREFBbUQ7S0FDakUsQ0FBQzs7d0RBQ3dCO0FBRzFCO0lBREMsbUJBQU0sQ0FBQyxDQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxDQUFDOzs7OytDQXNCN0M7QUFsQ0gsdUNBbUNDIn0=