import { ComponentRegistry } from '../component-registry';
import type { ICreateModuleOptions, IModuleOptions, IModuleConstructor } from '@loong-js/core';

export interface ICreateComponentOptions extends ICreateModuleOptions {
  initialProps?: any;
}

export type ComponentRegistryOptions = ICreateComponentOptions & IModuleOptions;

export type ComponentConstructor = IModuleConstructor<ICreateComponentOptions, ComponentRegistry>;

export const COMPONENT_TARGET_TYPE = Symbol('COMPONENT');

export function Component(options?: IModuleOptions) {
  return (target: ComponentConstructor) => {
    target.options = options;
    target.create = (createOptions?: ICreateComponentOptions) =>
      new ComponentRegistry(target, {
        ...options,
        ...createOptions,
      });
    target.type = COMPONENT_TARGET_TYPE;
    return target;
  };
}
