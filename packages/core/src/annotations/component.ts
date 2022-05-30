import { ComponentRegistry } from '../component-registry';

export interface IProviderConstructor extends Function {
  new (...args: any[]): any;
}

export interface IBasicProvider {
  provide: IProviderConstructor | Function;
}

export interface IClassProvider extends IBasicProvider {
  useClass: IProviderConstructor;
}

export type TypeProvider = IProviderConstructor;

export type Provider = IClassProvider | TypeProvider;

export interface IComponentOptions {
  providers?: Provider[];
}

export interface ICreateComponentOptions {
  initialProps?: any;
  dependencies?: any[];
  observe?: ComponentObserve;
  observable?: ComponentObservable;
}

export type ComponentRegistryOptions = ICreateComponentOptions & IComponentOptions;

export interface IComponentConstructor extends IProviderConstructor {
  createComponent?: (options?: ICreateComponentOptions) => ComponentRegistry;
}

export type ComponentObserve = (observeFunction: (...args: any[]) => any) => () => void;

export type ComponentObservable = <T extends object>(value: T) => T;

export function Component(
  options: IComponentOptions = {
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
