import { Model } from './Model';

export function beforeCreate(
  target: Model,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('beforeCreate', target, propertyName, descriptor);
}

export function afterCreate(
  target: Model,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('afterCreate', target, propertyName, descriptor);
}

export function beforeUpdate(
  target: Model,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('beforeUpdate', target, propertyName, descriptor);
}

export function afterUpdate(
  target: Model,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  Model.addHook('afterUpdate', target, propertyName, descriptor);
}
