import { Model } from './Model';
export declare function beforeCreate(target: Model, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function afterCreate(target: Model, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function beforeUpdate(target: Model, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function afterUpdate(target: Model, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void;
