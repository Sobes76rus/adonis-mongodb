"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const utils_1 = require("@poppinss/utils");
const mongodb_1 = require("mongodb");
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["CONNECTED"] = "CONNECTED";
    ConnectionStatus["DISCONNECTED"] = "DISCONNECTED";
})(ConnectionStatus || (ConnectionStatus = {}));
class Connection {
    constructor(name, config, logger) {
        this.$name = name;
        this.config = config;
        this.$logger = logger;
        this.$status = ConnectionStatus.DISCONNECTED;
        this.$client = new mongodb_1.MongoClient(this.config.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ...this.config.clientOptions,
        });
        this.$connectPromise = null;
    }
    async _ensureDb() {
        this.connect();
        if (!this.$connectPromise) {
            throw new utils_1.Exception(`unexpected MongoDB connection error`, 500, 'E_MONGODB_CONNECTION');
        }
        return this.$connectPromise;
    }
    connect() {
        if (this.$status === ConnectionStatus.CONNECTED) {
            return;
        }
        this.$status = ConnectionStatus.CONNECTED;
        this.$connectPromise = this.$client
            .connect()
            .then((client) => client.db(this.config.database));
        this.$connectPromise.catch((error) => {
            this.$logger.fatal(`could not connect to database "${this.$name}"`, error);
        });
    }
    async close() {
        if (this.$status === ConnectionStatus.DISCONNECTED) {
            return;
        }
        this.$connectPromise = null;
        this.$status = ConnectionStatus.DISCONNECTED;
        return this.$client.close();
    }
    async database() {
        return this._ensureDb();
    }
    async collection(collectionName) {
        const db = await this._ensureDb();
        return db.collection(collectionName);
    }
    async transaction(handler) {
        const db = await this._ensureDb();
        let result;
        await this.$client.withSession(async (session) => {
            return session.withTransaction(async (session) => {
                result = await handler(session, db);
            });
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return result;
    }
}
exports.Connection = Connection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db25uZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0QztBQUM1QyxxQ0FBcUU7QUFRckUsSUFBSyxnQkFHSjtBQUhELFdBQUssZ0JBQWdCO0lBQ25CLDJDQUF1QixDQUFBO0lBQ3ZCLGlEQUE2QixDQUFBO0FBQy9CLENBQUMsRUFISSxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBR3BCO0FBRUQsTUFBYSxVQUFVO0lBU3JCLFlBQ0UsSUFBWSxFQUNaLE1BQStCLEVBQy9CLE1BQXNCO1FBRXRCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO1FBQzdDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQzlDLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLGtCQUFrQixFQUFFLElBQUk7WUFDeEIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWE7U0FDN0IsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVPLEtBQUssQ0FBQyxTQUFTO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxpQkFBUyxDQUNqQixxQ0FBcUMsRUFDckMsR0FBRyxFQUNILHNCQUFzQixDQUN2QixDQUFDO1NBQ0g7UUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDOUIsQ0FBQztJQUVNLE9BQU87UUFDWixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssZ0JBQWdCLENBQUMsU0FBUyxFQUFFO1lBQy9DLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU87YUFDaEMsT0FBTyxFQUFFO2FBQ1QsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUNoQixrQ0FBa0MsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUMvQyxLQUFLLENBQ04sQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLO1FBQ2hCLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUU7WUFDbEQsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7UUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBUTtRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVUsQ0FDckIsY0FBc0I7UUFFdEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEMsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVyxDQUN0QixPQUE2RDtRQUU3RCxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQyxJQUFJLE1BQWUsQ0FBQztRQUNwQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUMvQyxPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUMvQyxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCw2REFBNkQ7UUFDN0QsYUFBYTtRQUNiLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FDRjtBQXhGRCxnQ0F3RkMifQ==