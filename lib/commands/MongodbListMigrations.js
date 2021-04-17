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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const standalone_1 = require("@adonisjs/core/build/standalone");
const cli_table3_1 = __importDefault(require("cli-table3"));
const Mongodb_1 = require("../src/Mongodb");
const MigrationCommand_1 = __importDefault(require("./util/MigrationCommand"));
class MongodbListMigrations extends MigrationCommand_1.default {
    async run(db) {
        if (this.connection && !db.hasConnection(this.connection)) {
            this.logger.error(`No MongoDB connection registered with name "${this.connection}"`);
            process.exitCode = 1;
            return;
        }
        try {
            const database = await db.connection().database();
            const coll = database.collection('__adonis_mongodb');
            const migrations = await this.getMigrations(db.connection().config);
            const migrationDocuments = await coll.find({}).toArray();
            const table = new cli_table3_1.default({
                head: ['Name', 'Status', 'Batch', 'Message'],
            });
            const imports = await Promise.all(migrations.map(({ file }) => this.importMigration(file)));
            /**
             * Push a new row to the table
             */
            migrations.forEach(({ name, file }, idx) => {
                const document = migrationDocuments.find((doc) => doc.name === name);
                const { description } = imports[idx];
                table.push([
                    file,
                    document
                        ? this.colors.green('completed')
                        : this.colors.yellow('pending'),
                    document ? document.batch : 'NA',
                    description || '',
                ]);
            });
            // eslint-disable-next-line no-console
            console.log(table.toString());
        }
        finally {
            await db.closeConnections();
        }
    }
}
MongodbListMigrations.commandName = 'mongodb:migration:status';
MongodbListMigrations.description = 'Show pending migrations';
MongodbListMigrations.settings = {
    loadApp: true,
};
__decorate([
    standalone_1.inject(['Mongodb/Database']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Mongodb_1.Mongodb]),
    __metadata("design:returntype", Promise)
], MongodbListMigrations.prototype, "run", null);
exports.default = MongodbListMigrations;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYkxpc3RNaWdyYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vY29tbWFuZHMvTW9uZ29kYkxpc3RNaWdyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0VBQXlEO0FBQ3pELDREQUFrQztBQUVsQyw0Q0FBeUM7QUFFekMsK0VBQXVEO0FBRXZELE1BQXFCLHFCQUFzQixTQUFRLDBCQUFnQjtJQVExRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQVc7UUFDMUIsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ2YsK0NBQStDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FDbEUsQ0FBQztZQUNGLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDUjtRQUNELElBQUk7WUFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNsRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDckQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVwRSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUV6RCxNQUFNLEtBQUssR0FBRyxJQUFJLG9CQUFRLENBQUM7Z0JBQ3pCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQzthQUM3QyxDQUFDLENBQUM7WUFFSCxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQy9CLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3pELENBQUM7WUFFRjs7ZUFFRztZQUNILFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDekMsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO2dCQUVyRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNULElBQUk7b0JBQ0osUUFBUTt3QkFDTixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO3dCQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO29CQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ2hDLFdBQVcsSUFBSSxFQUFFO2lCQUNsQixDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILHNDQUFzQztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO2dCQUFTO1lBQ1IsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUM3QjtJQUNILENBQUM7O0FBcERhLGlDQUFXLEdBQUcsMEJBQTBCLENBQUM7QUFDekMsaUNBQVcsR0FBRyx5QkFBeUIsQ0FBQztBQUN4Qyw4QkFBUSxHQUFHO0lBQ3ZCLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQztBQUdGO0lBREMsbUJBQU0sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O3FDQUNSLGlCQUFPOztnREE2QzNCO0FBckRILHdDQXNEQyJ9