"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const matchTimestamp = /^(?<timestamp>\d+)_.*$/;
function transformMigrations(rawMigrations, logger) {
    // Separate name and file fields
    const migrations = rawMigrations
        .flat()
        .sort((a, b) => path_1.basename(a, path_1.extname(a)).localeCompare(path_1.basename(b, path_1.extname(a))))
        .map((migrationFile) => ({
        name: path_1.basename(migrationFile, path_1.extname(migrationFile)),
        file: migrationFile,
    }));
    // Check migration file names
    let hadBadName = false;
    migrations.forEach(({ name, file }) => {
        var _a;
        const match = matchTimestamp.exec(name);
        const timestamp = Number((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.timestamp);
        if (Number.isNaN(timestamp) || timestamp === 0) {
            hadBadName = true;
            if (logger) {
                logger.error(`Invalid migration file: ${file}. Name must start with a timestamp`);
            }
        }
    });
    if (hadBadName) {
        throw new Error('some migration files are malformed');
    }
    // Check duplicates migration file names
    const duplicates = new Set(migrations.filter(({ name }, index) => migrations.map((migration) => migration.name).indexOf(name) !== index));
    if (duplicates.size > 0) {
        throw new Error(`found duplicate migration file names: ${[...duplicates]
            .map(({ name }) => name)
            .join(', ')}`);
    }
    return migrations;
}
exports.default = transformMigrations;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtTWlncmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbW1hbmRzL3V0aWwvdHJhbnNmb3JtTWlncmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUF5QztBQUl6QyxNQUFNLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQztBQU9oRCxTQUF3QixtQkFBbUIsQ0FDekMsYUFBeUIsRUFDekIsTUFBZTtJQUVmLGdDQUFnQztJQUNoQyxNQUFNLFVBQVUsR0FBMkIsYUFBYTtTQUNyRCxJQUFJLEVBQUU7U0FDTixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FDYixlQUFRLENBQUMsQ0FBQyxFQUFFLGNBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxlQUFRLENBQUMsQ0FBQyxFQUFFLGNBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQy9EO1NBQ0EsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksRUFBRSxlQUFRLENBQUMsYUFBYSxFQUFFLGNBQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUsYUFBYTtLQUNwQixDQUFDLENBQUMsQ0FBQztJQUVOLDZCQUE2QjtJQUM3QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDdkIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7O1FBQ3BDLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE1BQU0sMENBQUUsU0FBUyxDQUFDLENBQUM7UUFDbkQsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7WUFDOUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLE1BQU0sRUFBRTtnQkFDVixNQUFNLENBQUMsS0FBSyxDQUNWLDJCQUEyQixJQUFJLG9DQUFvQyxDQUNwRSxDQUFDO2FBQ0g7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxVQUFVLEVBQUU7UUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7S0FDdkQ7SUFFRCx3Q0FBd0M7SUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQ3hCLFVBQVUsQ0FBQyxNQUFNLENBQ2YsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQ2xCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUN4RSxDQUNGLENBQUM7SUFDRixJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IseUNBQXlDLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDckQsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO2FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUNoQixDQUFDO0tBQ0g7SUFFRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBakRELHNDQWlEQyJ9