import { ComponentRegistry } from '../component-registry';
import { ICreateModuleOptions, IModuleOptions, IProviderConstructor } from './module';

export interface ICreateComponentOptions extends ICreateModuleOptions {
  initialProps?: any;
  observe?: ComponentObserve;
  observable?: ComponentObservable;
}

export type ComponentRegistryOptions = ICreateComponentOptions & IModuleOptions;

export interface IComponentConstructor extends IProviderConstructor {
  createComponent?: (options?: ICreateComponentOptions) => ComponentRegistry;
}

export type ComponentObserve = (observeFunction: (...args: any[]) => any) => () => void;

export type ComponentObservable = <T extends object>(value: T) => T;

export function Component(
  options: IModuleOptions = {
    providers: [],
  }
) {
  return (target: IComponentConstructor) => {
    target.createComponent = (createOptions?: ICreateComponentOptions) =>
      new ComponentRegistry(target, {
        ...options,
        ...createOptions,
      });
    return target;
  };
}
