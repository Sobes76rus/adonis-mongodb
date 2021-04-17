"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MigrationType;
(function (MigrationType) {
    MigrationType["CreateCollection"] = "CreateCollection";
    MigrationType["CreateIndex"] = "CreateIndex";
    MigrationType["Custom"] = "Custom";
})(MigrationType || (MigrationType = {}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMigration(Database) {
    class Migration {
        constructor(connection, logger, session) {
            this.$operations = [];
            this.$connection = Database.connection(connection);
            this.$logger = logger;
            this.$session = session;
        }
        createCollections(collectionNames) {
            collectionNames.forEach((collectionName) => this.createCollection(collectionName));
        }
        createCollection(collectionName) {
            this.$operations.push({
                type: MigrationType.CreateCollection,
                name: collectionName,
            });
        }
        createIndex(collectionName, index, options) {
            this.$operations.push({
                type: MigrationType.CreateIndex,
                name: collectionName,
                index,
                options,
            });
        }
        defer(callback) {
            this.$operations.push({
                type: MigrationType.Custom,
                callback,
            });
        }
        async execUp() {
            this.up();
            await this._createCollections();
            await this._createIndexes();
            await this._executeDeferred();
        }
        async _listCollections() {
            if (this.$collectionList)
                return this.$collectionList;
            const db = await this.$connection.database();
            const cursor = db.listCollections(undefined, {
                nameOnly: true,
            });
            const list = await cursor.toArray();
            this.$collectionList = list.map((element) => element.name);
            return this.$collectionList;
        }
        async _createCollections() {
            const db = await this.$connection.database();
            for (const op of this.$operations.filter(isCreateCollection)) {
                this.$logger.info(`Creating collection ${op.name}`);
                await db.createCollection(op.name, { session: this.$session });
            }
        }
        async _executeDeferred() {
            const db = await this.$connection.database();
            for (const op of this.$operations.filter(isCustom)) {
                await op.callback(db, this.$session);
            }
        }
        async _createIndexes() {
            const db = await this.$connection.database();
            const collections = await this._listCollections();
            for (const op of this.$operations.filter(isCreateIndex)) {
                this.$logger.info(`Creating index on ${op.name}`);
                await db.createIndex(op.name, op.index, {
                    ...op.options,
                    // index creation will fail if collection pre-exists the transaction
                    session: collections.includes(op.name) ? undefined : this.$session,
                });
            }
        }
    }
    return Migration;
}
exports.default = createMigration;
function isCreateCollection(op) {
    return op.type === MigrationType.CreateCollection;
}
function isCreateIndex(op) {
    return op.type === MigrationType.CreateIndex;
}
function isCustom(op) {
    return op.type === MigrationType.Custom;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL01pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLElBQUssYUFJSjtBQUpELFdBQUssYUFBYTtJQUNoQixzREFBcUMsQ0FBQTtJQUNyQyw0Q0FBMkIsQ0FBQTtJQUMzQixrQ0FBaUIsQ0FBQTtBQUNuQixDQUFDLEVBSkksYUFBYSxLQUFiLGFBQWEsUUFJakI7QUF3QkQsOERBQThEO0FBQzlELFNBQXdCLGVBQWUsQ0FBQyxRQUFpQjtJQUN2RCxNQUFlLFNBQVM7UUFPdEIsWUFDRSxVQUE4QixFQUM5QixNQUFjLEVBQ2QsT0FBc0I7WUFUaEIsZ0JBQVcsR0FBeUIsRUFBRSxDQUFDO1lBVzdDLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUMxQixDQUFDO1FBRU0saUJBQWlCLENBQUMsZUFBeUI7WUFDaEQsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FDdEMsQ0FBQztRQUNKLENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxjQUFzQjtZQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDcEIsSUFBSSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0I7Z0JBQ3BDLElBQUksRUFBRSxjQUFjO2FBQ3JCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTSxXQUFXLENBQ2hCLGNBQXNCLEVBQ3RCLEtBQXVDLEVBQ3ZDLE9BQXNCO1lBRXRCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUNwQixJQUFJLEVBQUUsYUFBYSxDQUFDLFdBQVc7Z0JBQy9CLElBQUksRUFB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