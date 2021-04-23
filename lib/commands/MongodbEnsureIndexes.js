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
    async run(db, tModel) {
        if (this.connection && !db.hasConnection(this.connection)) {
            this.logger.error(`no MongoDB connection registered with name "${this.connection}"`);
            process.exitCode = 1;
            return;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYkVuc3VyZUluZGV4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jb21tYW5kcy9Nb25nb2RiRW5zdXJlSW5kZXhlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLGdFQUt5QztBQUt6QyxNQUFxQixvQkFBcUIsU0FBUSx3QkFBVztJQWFwRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQW1CLEVBQUUsTUFBb0I7UUFDeEQsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ2YsK0NBQStDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FDbEUsQ0FBQztZQUVGLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDUjtRQUVELGFBQWE7UUFDYixLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDbkMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxNQUFNLFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVoRCxLQUFLLElBQUksS0FBSyxJQUFJLE9BQU8sRUFBRTtnQkFDekIsYUFBYTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0RDtTQUNGO0lBQ0gsQ0FBQzs7QUFqQ2EsZ0NBQVcsR0FBRyx3QkFBd0IsQ0FBQztBQUN2QyxnQ0FBVyxHQUFHLGdCQUFnQixDQUFDO0FBQy9CLDZCQUFRLEdBQUc7SUFDdkIsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBS0Y7SUFIQyxrQkFBSyxDQUFDLE1BQU0sQ0FBQztRQUNaLFdBQVcsRUFBRSxtREFBbUQ7S0FDakUsQ0FBQzs7d0RBQ3dCO0FBRzFCO0lBREMsbUJBQU0sQ0FBQyxDQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxDQUFDOzs7OytDQXNCN0M7QUFsQ0gsdUNBbUNDIn0=