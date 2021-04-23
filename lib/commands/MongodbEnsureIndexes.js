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
class MongodbEnsureIndexes extends standalone_1.BaseCommand {
    async run(db, ModelNS) {
        if (this.connection && !db.hasConnection(this.connection)) {
            this.logger.error(`no MongoDB connection registered with name "${this.connection}"`);
            process.exitCode = 1;
            return;
        }
        const tModel = ModelNS.Model;
        // @ts-ignore
        for (let model of tModel.$allModels) {
            const indexes = model.prepareIndexes(model);
            const collection = await tModel.getCollection();
            for (let index of indexes) {
                // @ts-ignore
                this.logger.info(`Create index on ${collection.name}`);
                await collection.createIndex(index.keys, index.opts);
            }
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
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MongodbEnsureIndexes.prototype, "run", null);
exports.default = MongodbEnsureIndexes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYkVuc3VyZUluZGV4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jb21tYW5kcy9Nb25nb2RiRW5zdXJlSW5kZXhlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLGdFQUt5QztBQUt6QyxNQUFxQixvQkFBcUIsU0FBUSx3QkFBVztJQWFwRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQW1CLEVBQUUsT0FBWTtRQUNoRCxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZiwrQ0FBK0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUNsRSxDQUFDO1lBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDckIsT0FBTztTQUNSO1FBRUQsTUFBTSxNQUFNLEdBQWlCLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDM0MsYUFBYTtRQUNiLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUNuQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRWhELEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUN6QixhQUFhO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3REO1NBQ0Y7SUFDSCxDQUFDOztBQWxDYSxnQ0FBVyxHQUFHLHdCQUF3QixDQUFDO0FBQ3ZDLGdDQUFXLEdBQUcsZ0JBQWdCLENBQUM7QUFDL0IsNkJBQVEsR0FBRztJQUN2QixPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUM7QUFLRjtJQUhDLGtCQUFLLENBQUMsTUFBTSxDQUFDO1FBQ1osV0FBVyxFQUFFLG1EQUFtRDtLQUNqRSxDQUFDOzt3REFDd0I7QUFHMUI7SUFEQyxtQkFBTSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUM7Ozs7K0NBdUI3QztBQW5DSCx1Q0FvQ0MifQ==