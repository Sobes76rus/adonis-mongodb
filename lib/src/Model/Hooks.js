"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterDelete = exports.beforeDelete = exports.afterUpdate = exports.beforeUpdate = exports.afterCreate = exports.beforeCreate = void 0;
const Model_1 = require("./Model");
function beforeCreate(target, propertyName, descriptor) {
    Model_1.Model.addHook('beforeCreate', target, propertyName, descriptor);
}
exports.beforeCreate = beforeCreate;
function afterCreate(target, propertyName, descriptor) {
    Model_1.Model.addHook('afterCreate', target, propertyName, descriptor);
}
exports.afterCreate = afterCreate;
function beforeUpdate(target, propertyName, descriptor) {
    Model_1.Model.addHook('beforeUpdate', target, propertyName, descriptor);
}
exports.beforeUpdate = beforeUpdate;
function afterUpdate(target, propertyName, descriptor) {
    Model_1.Model.addHook('afterUpdate', target, propertyName, descriptor);
}
exports.afterUpdate = afterUpdate;
function beforeDelete(target, propertyName, descriptor) {
    Model_1.Model.addHook('beforeDelete', target, propertyName, descriptor);
}
exports.beforeDelete = beforeDelete;
function afterDelete(target, propertyName, descriptor) {
    Model_1.Model.addHook('afterDelete', target, propertyName, descriptor);
}
exports.afterDelete = afterDelete;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWwvSG9va3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9EO0FBRXBELFNBQWdCLFlBQVksQ0FDMUIsTUFBa0MsRUFDbEMsWUFBb0IsRUFDcEIsVUFBNkM7SUFFN0MsYUFBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBTkQsb0NBTUM7QUFFRCxTQUFnQixXQUFXLENBQ3pCLE1BQWtDLEVBQ2xDLFlBQW9CLEVBQ3BCLFVBQTZDO0lBRTdDLGFBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQU5ELGtDQU1DO0FBRUQsU0FBZ0IsWUFBWSxDQUMxQixNQUFrQyxFQUNsQyxZQUFvQixFQUNwQixVQUE2QztJQUU3QyxhQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFORCxvQ0FNQztBQUVELFNBQWdCLFdBQVcsQ0FDekIsTUFBa0MsRUFDbEMsWUFBb0IsRUFDcEIsVUFBNkM7SUFFN0MsYUFBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBTkQsa0NBTUM7QUFFRCxTQUFnQixZQUFZLENBQzFCLE1BQWtDLEVBQ2xDLFlBQW9CLEVBQ3BCLFVBQTZDO0lBRTdDLGFBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQU5ELG9DQU1DO0FBRUQsU0FBZ0IsV0FBVyxDQUN6QixNQUFrQyxFQUNsQyxZQUFvQixFQUNwQixVQUE2QztJQUU3QyxhQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFORCxrQ0FNQyJ9