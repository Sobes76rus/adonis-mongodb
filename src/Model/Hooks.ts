import { Model, AutoIncrementModel } from './Model';

export function beforeCreate(
  target: Model | AutoIncrementModel,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('beforeCreate', target, propertyName, descriptor);
}

export function afterCreate(
  target: Model | AutoIncrementModel,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('afterCreate', target, propertyName, descriptor);
}

export function beforeUpdate(
  target: Model | AutoIncrementModel,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('beforeUpdate', target, propertyName, descriptor);
}

export function afterUpdate(
  target: Model | AutoIncrementModel,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('afterUpdate', target, propertyName, descriptor);
}

export function beforeDelete(
  target: Model | AutoIncrementModel,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('beforeDelete', target, propertyName, descriptor);
}

export function afterDelete(
  target: Model | AutoIncrementModel,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('afterDelete', target, propertyName, descriptor);
}
