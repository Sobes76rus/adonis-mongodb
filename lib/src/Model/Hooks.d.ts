import { Model, AutoIncrementModel } from './Model';
export declare function beforeCreate(target: Model | AutoIncrementModel, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function afterCreate(target: Model | AutoIncrementModel, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function beforeUpdate(target: Model | AutoIncrementModel, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function afterUpdate(target: Model | AutoIncrementModel, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
