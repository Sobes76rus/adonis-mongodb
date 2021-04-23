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
class MongodbMakeModel extends standalone_1.BaseCommand {
    async run() {
        const { name } = this;
        if (name.includes('/')) {
            this.logger.error('name argument should not contain any slash');
            process.exitCode = 1;
            return;
        }
        const folder = 'app/Models';
        const stub = path_1.join(__dirname, '../../templates/model.txt');
        this.generator
            .addFile(name, { pattern: 'snakecase' })
            .stub(stub)
            .destinationDir(folder)
            .appRoot(this.application.makePathFromCwd())
            .apply({
            className: `${name[0].toUpperCase()}${name.slice(1)}`,
        });
        await this.generator.run();
    }
}
MongodbMakeModel.commandName = 'mongodb:make:model';
MongodbMakeModel.description = 'Make a new model file';
MongodbMakeModel.settings = {
    loadApp: true,
};
__decorate([
    standalone_1.args.string({ description: 'Name of the model file' }),
    __metadata("design:type", String)
], MongodbMakeModel.prototype, "name", void 0);
exports.default = MongodbMakeModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29kYk1ha2VNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2NvbW1hbmRzL01vbmdvZGJNYWtlTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwrQkFBNEI7QUFFNUIsZ0VBQW9FO0FBRXBFLE1BQXFCLGdCQUFpQixTQUFRLHdCQUFXO0lBVWhELEtBQUssQ0FBQyxHQUFHO1FBQ2QsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztZQUNoRSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixPQUFPO1NBQ1I7UUFFRCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFDNUIsTUFBTSxJQUFJLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxTQUFTO2FBQ1gsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQzthQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ1YsY0FBYyxDQUFDLE1BQU0sQ0FBQzthQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUMzQyxLQUFLLENBQUM7WUFDTCxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUN0RCxDQUFDLENBQUM7UUFFTCxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7QUE5QmEsNEJBQVcsR0FBRyxvQkFBb0IsQ0FBQztBQUNuQyw0QkFBVyxHQUFHLHVCQUF1QixDQUFDO0FBQ3RDLHlCQUFRLEdBQUc7SUFDdkIsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBR0Y7SUFEQyxpQkFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxDQUFDOzs4Q0FDbkM7QUFSdEIsbUNBZ0NDIn0=