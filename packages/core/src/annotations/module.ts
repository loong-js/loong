import { ModuleRegistry } from '../module-registry';
import { Dependency } from '../provider-registry';

export interface IProviderConstructor extends Function {
  new (...args: any[]): any;
}

export enum ProvidedInType {
  ROOT = 'root',
  SELF = 'self',
}

export type Provide = IProviderConstructor | Function;

export interface IBasicProvider {
  provide: Provide;
  providedIn?: Lowercase<keyof typeof ProvidedInType>;
  useClass?: IProviderConstructor;
}

export type Provider = IBasicProvider | IProviderConstructor;

export interface IModuleOptions {
  providers?: Provider[];
}

export interface ICreateModuleOptions {
  dependencies?: Dependency[];
}

export type ModuleRegistryOptions = ICreateModuleOptions & IModuleOptions;

export interface IModuleConstructor extends IProviderConstructor {
  createModule?: (options?: ICreateModuleOptions) => ModuleRegistry;
}

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
