import { ModuleRegistry } from '../module-registry';
import { Dependency } from '../provider-registry';

export interface IProviderConstructor extends Function {
  new (...args: any[]): any;
}

export enum ProvidedInType {
  ROOT = 'root',
  SELF = 'self',
}

// It may be an abstract class, and the type is Function.
export type Provide = IProviderConstructor | Function;

export interface IBasicProvider {
  provide: Provide;
  providedIn?: Lowercase<keyof typeof ProvidedInType>;
  useClass?: IProviderConstructor;
}

export type Provider = IBasicProvider | IProviderConstructor;

export type Providers = Provider[];

export interface IModuleOptions {
  imports?: ModuleConstructor[];
  providers?: Providers;
}

export interface ICreateModuleOptions {
  useProvidedIn?: boolean;
  dependencies?: Dependency[];
  observe?: ModuleObserve;
  observable?: ModuleObservable;
}

export type ModuleObserve = (observeFunction: (...args: any[]) => any) => () => void;

export type ModuleObservable = <T extends object>(value: T) => T;

export type ModuleRegistryOptions = ICreateModuleOptions & IModuleOptions;

export interface IModuleConstructor<O, R> extends IProviderConstructor {
  create?: (options?: O) => R;
  options?: IModuleOptions;
  type?: symbol;
}

export type ModuleConstructor = IModuleConstructor<ICreateModuleOptions, ModuleRegistry>;

export const MODULE_TARGET_TYPE = Symbol('MODULE');

export function Module(options?: IModuleOptions) {
  return (target: ModuleConstructor) => {
    target.options = options;
    target.create = (createOptions?: ICreateModuleOptions) =>
      new ModuleRegistry(target, {
        ...options,
        ...createOptions,
      });
    target.type = MODULE_TARGET_TYPE;
    return target;
  };
}
