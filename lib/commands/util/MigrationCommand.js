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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationLockCollectionName = exports.migrationCollectionName = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const standalone_1 = require("@adonisjs/core/build/standalone");
const transformMigrations_1 = __importDefault(require("./transformMigrations"));
const folder = 'mongodb/migrations';
exports.migrationCollectionName = '__adonis_mongodb';
exports.migrationLockCollectionName = '__adonis_mongodb_lock';
class MigrationCommand extends standalone_1.BaseCommand {
    async getMigrations(config) {
        const folders = config.migrations && config.migrations.length > 0
            ? config.migrations
            : [folder];
        const rawMigrationFiles = await Promise.all(folders
            .map((folder) => path_1.join(this.application.appRoot, folder))
            .map(async (migrationsPath) => {
            try {
                const files = await promises_1.readdir(migrationsPath);
                return files
                    .filter((file) => path_1.extname(file) === '.js' || path_1.extname(file) === '.ts')
                    .map((file) => path_1.join(migrationsPath, file));
            }
            catch {
                return [];
            }
        }));
        return transformMigrations_1.default(rawMigrationFiles, this.logger);
    }
    async importMigration(file) {
        const module = await Promise.resolve().then(() => __importStar(require(file)));
        const { default: Migration, description } = module;
        if (!Migration || typeof Migration !== 'function') {
            throw new Error(`Migration in ${file} must export a default class`);
        }
        return { Migration, description };
    }
}
MigrationCommand.settings = {
    loadApp: true,
};
MigrationCommand.commandName = 'commandName';
MigrationCommand.description = 'description';
__decorate([
    standalone_1.flags.string({ description: 'Database connection to use for the migration' }),
    __metadata("design:type", String)
], MigrationCommand.prototype, "connection", void 0);
exports.default = MigrationCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbW1hbmRzL3V0aWwvTWlncmF0aW9uQ29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMENBQXNDO0FBQ3RDLCtCQUFxQztBQUVyQyxnRUFBcUU7QUFPckUsZ0ZBRStCO0FBRS9CLE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDO0FBRXZCLFFBQUEsdUJBQXVCLEdBQUcsa0JBQWtCLENBQUM7QUFDN0MsUUFBQSwyQkFBMkIsR0FBRyx1QkFBdUIsQ0FBQztBQVduRSxNQUE4QixnQkFBaUIsU0FBUSx3QkFBVztJQVd0RCxLQUFLLENBQUMsYUFBYSxDQUMzQixNQUErQjtRQUUvQixNQUFNLE9BQU8sR0FDWCxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDL0MsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVO1lBQ25CLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWYsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ3pDLE9BQU87YUFDSixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFdBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQzthQUN2RCxHQUFHLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO1lBQzVCLElBQUk7Z0JBQ0YsTUFBTSxLQUFLLEdBQUcsTUFBTSxrQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLEtBQUs7cUJBQ1QsTUFBTSxDQUNMLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLGNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQzdEO3FCQUNBLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1lBQUMsTUFBTTtnQkFDTixPQUFPLEVBQUUsQ0FBQzthQUNYO1FBQ0gsQ0FBQyxDQUFDLENBQ0wsQ0FBQztRQUVGLE9BQU8sNkJBQW1CLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFUyxLQUFLLENBQUMsZUFBZSxDQUM3QixJQUFZO1FBRVosTUFBTSxNQUFNLEdBQW9CLHdEQUFhLElBQUksR0FBQyxDQUFDO1FBQ25ELE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNuRCxJQUFJLENBQUMsU0FBUyxJQUFJLE9BQU8sU0FBUyxLQUFLLFVBQVUsRUFBRTtZQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixJQUFJLDhCQUE4QixDQUFDLENBQUM7U0FDckU7UUFDRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7O0FBL0NhLHlCQUFRLEdBQUc7SUFDdkIsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBRVksNEJBQVcsR0FBRyxhQUFhLENBQUM7QUFDNUIsNEJBQVcsR0FBRyxhQUFhLENBQUM7QUFHMUM7SUFEQyxrQkFBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSw4Q0FBOEMsRUFBRSxDQUFDOztvREFDcEQ7QUFUNUIsbUNBaURDIn0=