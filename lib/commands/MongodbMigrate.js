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
Object.defineProperty(exports, "__esModule", { value: true });
const standalone_1 = require("@adonisjs/core/build/standalone");
const Mongodb_1 = require("../src/Mongodb");
const MigrationCommand_1 = __importStar(require("./util/MigrationCommand"));
class MongodbMigrate extends MigrationCommand_1.default {
    async _executeMigration(db) {
        const migrations = await this.getMigrations(db.connection().config);
        const connectionName = this.connection || undefined;
        const connection = db.connection(connectionName);
        await connection.transaction(async (session) => {
            const migrationLockColl = await connection.collection(MigrationCommand_1.migrationLockCollectionName);
            const migrationColl = await connection.collection(MigrationCommand_1.migrationCollectionName);
            const lock = await migrationLockColl.updateOne({
                _id: 'migration_lock',
            }, {
                $set: { running: true },
            }, {
                upsert: true,
            });
            if (lock.modifiedCount === 0 && lock.upsertedCount === 0) {
                this.logger.error('A migration is already running');
                process.exitCode = 1;
                await db.closeConnections();
                return;
            }
            try {
                let migrationDocsCursor = migrationColl.find({});
                const migrationDocs = await migrationDocsCursor.toArray();
                const dbMigrationNames = migrationDocs.map((m) => m.name);
                // Keep migrations that are not yet registered
                const unregisteredMigrations = migrations.filter((migration) => !dbMigrationNames.includes(migration.name));
                // Keep migrations that are not yet registered
                let executed = 0;
                // Get the next incremental batch value
                const value = await migrationColl
                    .aggregate([
                    {
                        $project: {
                            maxBatch: { $max: '$batch' },
                        },
                    },
                ])
                    .toArray();
                let newBatch = 1;
                if (value.length === 1) {
                    newBatch = value[0].maxBatch + 1;
                }
                for (const { name, file } of unregisteredMigrations) {
                    const { Migration, description } = await this.importMigration(file);
                    this.logger.info(`Executing migration: ${name}${description ? ` - ${description}` : ''}`);
                    const migration = new Migration(connectionName, this.logger, session);
                    await migration.execUp();
                    executed++;
                }
                if (unregisteredMigrations.length > 0) {
                    await migrationColl.insertMany(unregisteredMigrations.map(({ name }) => ({
                        name,
                        date: new Date(),
                        batch: newBatch,
                    }), {
                        session,
                    }));
                }
                if (executed > 0) {
                    this.logger.info(`Executed ${executed} migrations`);
                }
                else {
                    this.logger.info('No pending migration');
                }
            }
            catch (err) {
                this.logger.error('Migration failed');
                // TODO: See if there can be a way in Ace commands to print error stack traces
                // eslint-disable-next-line no-console
                console.error(err);
                await session.abortTransaction();
            }
            finally {
                await migrationLockColl.updateOne({
                    _id: 'migration_lock',
                    running: true,
                }, {
                    $set: { running: false },
                });
            }
        });
    }
    async run(db) {
        if (this.connection && !db.hasConnection(this.connection)) {
            this.logger.error(`No MongoDB connection registered with name "${this.connection}"`);
            process.exitCode = 1;
            return;
        }
        try {
            await this._executeMigration(db);
        }
        finally {
            await db.closeConnections();
        }
    }
}
MongodbMigrate.commandName = 'mongodb:migration:run';
MongodbMigrate.description = 'Execute pending migrations';
MongodbMigrate.settings = {
    loadApp: true,
};
__decorate([
    standalone_1.inject(['Mongodb/Database']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Mongodb_1.Mongodb]),
    __metadata("design:returntype", Promise)
], MongodbMigrate.prototype, "run", null);
exports.default = MongodbMigrate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYk1pZ3JhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jb21tYW5kcy9Nb25nb2RiTWlncmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnRUFBeUQ7QUFHekQsNENBQXlDO0FBRXpDLDRFQUdpQztBQVNqQyxNQUFxQixjQUFlLFNBQVEsMEJBQWdCO0lBT2xELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFXO1FBQ3pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUM7UUFDcEQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVqRCxNQUFNLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQzdDLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUNuRCw4Q0FBMkIsQ0FDNUIsQ0FBQztZQUVGLE1BQU0sYUFBYSxHQUFHLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FDL0MsMENBQXVCLENBQ3hCLENBQUM7WUFFRixNQUFNLElBQUksR0FBRyxNQUFNLGlCQUFpQixDQUFDLFNBQVMsQ0FDNUM7Z0JBQ0UsR0FBRyxFQUFFLGdCQUFnQjthQUN0QixFQUNEO2dCQUNFLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7YUFDeEIsRUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTthQUNiLENBQ0YsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hELElBQUksQ0FBQyxNQUFNLENB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