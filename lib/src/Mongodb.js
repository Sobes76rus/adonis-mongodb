"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mongodb = void 0;
const utils_1 = require("@poppinss/utils");
const Connection_1 = require("./Connection");
class Mongodb {
    constructor(config, logger) {
        this.$config = config;
        this.$logger = logger;
        this.$defaultConnectionName = config.default;
        this.$connections = new Map();
        this._registerConnections();
    }
    _registerConnections() {
        const config = this.$config.connections;
        for (const [connectionName, connectionConfig] of Object.entries(config)) {
            this.$connections.set(connectionName, new Connection_1.Connection(connectionName, connectionConfig, this.$logger));
        }
    }
    hasConnection(connectionName) {
        return this.$connections.has(connectionName);
    }
    connection(connectionName = this.$defaultConnectionName) {
        if (!this.hasConnection(connectionName)) {
            throw new utils_1.Exception(`no MongoDB connection registered with name "${connectionName}"`, 500, 'E_NO_MONGODB_CONNECTION');
        }
        const connection = this.$connections.get(connectionName);
        return connection;
    }
    async closeConnections() {
        await Promise.all([...this.$connections.values()].map(async (connection) => connection.close()));
    }
}
exports.Mongodb = Mongodb;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb25nb2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0QztBQUs1Qyw2Q0FBMEM7QUFFMUMsTUFBYSxPQUFPO0lBTWxCLFlBQW1CLE1BQXFCLEVBQUUsTUFBc0I7UUFDOUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTyxvQkFBb0I7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDeEMsS0FBSyxNQUFNLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIsY0FBYyxFQUNkLElBQUksdUJBQVUsQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUMvRCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRU0sYUFBYSxDQUFDLGNBQXNCO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLFVBQVUsQ0FDZixpQkFBeUIsSUFBSSxDQUFDLHNCQUFzQjtRQUVwRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN2QyxNQUFNLElBQUksaUJBQVMsQ0FDakIsK0NBQStDLGNBQWMsR0FBRyxFQUNoRSxHQUFHLEVBQ0gseUJBQXlCLENBQzFCLENBQUM7U0FDSDtRQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBZSxDQUFDO1FBQ3ZFLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFTSxLQUFLLENBQUMsZ0JBQWdCO1FBQzNCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDZixDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FDdkQsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUNuQixDQUNGLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFsREQsMEJBa0RDIn0=