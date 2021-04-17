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
const path_1 = require("path");
const standalone_1 = require("@adonisjs/core/build/standalone");
class MongodbMakeMigration extends standalone_1.BaseCommand {
    async run(db) {
        const { name } = this;
        if (name.includes('/')) {
            this.logger.error('name argument should not contain any slash');
            process.exitCode = 1;
            return;
        }
        if (this.connection && !db.hasConnection(this.connection)) {
            this.logger.error(`no MongoDB connection registered with name "${this.connection}"`);
            process.exitCode = 1;
            return;
        }
        const folder = 'mongodb/migrations';
        const stub = path_1.join(__dirname, '../../templates/migration.txt');
        this.generator
            .addFile(name, { prefix: String(Date.now()), pattern: 'snakecase' })
            .stub(stub)
            .destinationDir(folder)
            .appRoot(this.application.makePathFromCwd())
            .apply({
            className: `${name[0].toUpperCase()}${name.slice(1)}Migration`,
        });
        await this.generator.run();
    }
}
MongodbMakeMigration.commandName = 'mongodb:make:migration';
MongodbMakeMigration.description = 'Make a new migration file';
MongodbMakeMigration.settings = {
    loadApp: true,
};
__decorate([
    standalone_1.args.string({ description: 'Name of the migration file' }),
    __metadata("design:type", String)
], MongodbMakeMigration.prototype, "name", void 0);
__decorate([
    standalone_1.flags.string({ description: 'Database connection to use for the migration' }),
    __metadata("design:type", String)
], MongodbMakeMigration.prototype, "connection", void 0);
__decorate([
    standalone_1.inject(['Mongodb/Database']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MongodbMakeMigration.prototype, "run", null);
exports.default = MongodbMakeMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYk1ha2VNaWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jb21tYW5kcy9Nb25nb2RiTWFrZU1pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLCtCQUE0QjtBQUU1QixnRUFLeUM7QUFJekMsTUFBcUIsb0JBQXFCLFNBQVEsd0JBQVc7SUFjcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFtQjtRQUNsQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDUjtRQUVELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNmLCtDQUErQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQ2xFLENBQUM7WUFDRixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixPQUFPO1NBQ1I7UUFFRCxNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztRQUVwQyxNQUFNLElBQUksR0FBRyxXQUFJLENBQUMsU0FBUyxFQUFFLCtCQUErQixDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLFNBQVM7YUFDWCxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUM7YUFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNWLGNBQWMsQ0FBQyxNQUFNLENBQUM7YUFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0MsS0FBSyxDQUFDO1lBQ0wsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVc7U0FDL0QsQ0FBQyxDQUFDO1FBQ0wsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7O0FBMUNhLGdDQUFXLEdBQUcsd0JBQXdCLENBQUM7QUFDdkMsZ0NBQVcsR0FBRywyQkFBMkIsQ0FBQztBQUMxQyw2QkFBUSxHQUFHO0lBQ3ZCLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQztBQUdGO0lBREMsaUJBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsNEJBQTRCLEVBQUUsQ0FBQzs7a0RBQ3ZDO0FBR3BCO0lBREMsa0JBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsOENBQThDLEVBQUUsQ0FBQzs7d0RBQ3BEO0FBRzFCO0lBREMsbUJBQU0sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Ozs7K0NBOEI1QjtBQTNDSCx1Q0E0Q0MifQ==