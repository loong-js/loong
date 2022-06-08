import { ModuleRegistry } from '../module-registry';

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

export interface IModuleOptions {
  providers?: Provider[];
}

export interface ICreateModuleOptions {
  initialProps?: any;
  dependencies?: any[];
  observe?: ModuleObserve;
  observable?: ModuleObservable;
}

export type ModuleRegistryOptions = ICreateModuleOptions & IModuleOptions;

export interface IModuleConstructor extends IProviderConstructor {
  createModule?: (options?: ICreateModuleOptions) => ModuleRegistry;
}

export type ModuleObserve = (observeFunction: (...args: any[]) => any) => () => void;

export type ModuleObservable = <T extends object>(value: T) => T;

export function Module(
  options: IModuleOptions = {
    providers: [],
  }
) {
  return (target: IModuleConstructor) => {
    target.createModule = (createOptions?: ICreateModuleOptions) =>
      new ModuleRegistry(target, {
        ...options,
        ...createOptions,
      });
    return target;
  };
}
