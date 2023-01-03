import { isPlainObject } from '@loong-js/shared';
import {
  IBasicProvider,
  IProviderConstructor,
  Provide,
  ProvidedInType,
  Provider,
} from './annotations/module';
import { injectableTargetMap } from './annotations/injectable';
import { ModuleRegistryOptions } from './annotations/module';
import { resetInitialProvider, setInitialProvider } from './initial-provider';
import { setInitialProviderRegistry } from './initial-provider-registry';
import { error } from './utils/error';
import { providerToModuleRegistryMap } from './module-registry';
import {
  deletePlatformProvider,
  getPlatformProvider,
  setPlatformProvider,
} from './platform-provider';

// Prevent circular dependency.
export enum ProviderStatus {
  INSTANTIATING,
  INSTANTIATED,
}

export interface IProvider {
  status: ProviderStatus;
  basicProvider: IBasicProvider;
  instance?: any;
}

export type Dependency = Partial<IProvider> | any;

export function hasBasicProvider(provider: Provider): provider is IBasicProvider {
  if (provider && typeof provider === 'object') {
    if (provider.provide) {
      return true;
    }
  }
  return false;
}

export class ProviderRegistry {
  private providerMap = new Map<Provide, IProvider>();

  private dependencyMap = new Map<Provide, IProvider>();

  private get providers() {
    return this.options.providers || [];
  }

  private get dependencies() {
    return this.options.dependencies || [];
  }

  constructor(
    private module: IProviderConstructor,
    private options: ModuleRegistryOptions,
    private afterRegistration?: (providerRegistry: ProviderRegistry) => void
  ) {
    setInitialProviderRegistry(this);
    this.initializeMap();
    this.registerProviders(this.providers);
    this.afterRegistration?.(this);
    this.registerProvider(module);
    resetInitialProvider();
  }

  private initializeMap() {
    this.dependencies.forEach((dependency) => {
      if (isPlainObject(dependency)) {
        this.dependencyMap.set(dependency.basicProvider.provide, dependency);
      } else {
        const provide = dependency.constructor;
        this.dependencyMap.set(provide, {
          status: ProviderStatus.INSTANTIATED,
          basicProvider: {
            provide: provide,
            useClass: provide,
          },
          instance: dependency,
        });
      }
    });
  }

  registerProvider(provider: Provider, instantiatingProvider?: IProviderConstructor) {
    let basicProvider: IBasicProvider;

    if (hasBasicProvider(provider)) {
      basicProvider = provider;
      basicProvider.useClass = provider.useClass || (provider.provide as IProviderConstructor);
    } else {
      basicProvider = {
        // Type of provider to look for.
        provide: provider,
        useClass: provider,
      };
    }

    if (!basicProvider.provide) {
      error('Providers must have the provide attribute');
    }

    // Actual instantiated provider.
    const Provider = basicProvider.useClass as IProviderConstructor;
    const provide = basicProvider.provide as Provide;

    // Check whether the provider is registered with injectable.
    if (this.module !== Provider && !injectableTargetMap.has(Provider)) {
      error(`${Provider.name} is not registered with injectable`);
    }

    if (this.providerMap.get(provide)?.status === ProviderStatus.INSTANTIATED) {
      return;
    }

    if (this.providerMap.get(provide)?.status === ProviderStatus.INSTANTIATING) {
      error(
        `Circular dependency found ${Provider.name} -> ${instantiatingProvider?.name} -> ${Provider.name}`
      );
    }

    this.providerMap.set(provide, {
      basicProvider,
      status: ProviderStatus.INSTANTIATING,
    });

    const paramtypes: IProviderConstructor[] =
      Reflect.getMetadata('design:paramtypes', Provider) || [];

    if (this.module !== Provider) {
      // Register dependent providers first.
      this.registerProviders(paramtypes, Provider);
    }

    setInitialProvider(Provider);
    const instance = new Provider(
      ...paramtypes.map((designProvide) => this.getProvider(designProvide))
    );
    resetInitialProvider();

    const instantiatedProvider: IProvider = {
      instance,
      basicProvider,
      status: ProviderStatus.INSTANTIATED,
    };
    this.providerMap.set(provide, instantiatedProvider);
    if (basicProvider.providedIn === ProvidedInType.PLATFORM) {
      setPlatformProvider(instantiatedProvider);
    }
  }

  private registerProviders(providers: Provider[], instantiatingProvider?: IProviderConstructor) {
    providers.forEach((provider: any) => {
      this.registerProvider(provider, instantiatingProvider);
    });
  }

  getProvider(provide: Provide) {
    return (
      this.providerMap.get(provide)?.instance ||
      this.dependencyMap.get(provide)?.instance ||
      getPlatformProvider(provide)
    );
  }

  setProviderInstance(provider: IProviderConstructor, instance: any) {
    const result = this.providerMap.get(provider);
    if (result) {
      this.providerMap.set(provider, {
        ...result,
        instance,
      });
    } else {
      // The current function is to set the module,
      // which has already been installed.
      this.providerMap.set(provider, {
        instance,
        basicProvider: {
          provide: provider,
          useClass: provider,
        },
        status: ProviderStatus.INSTANTIATED,
      });
    }
  }

  getProviders() {
    const providers: any[] = [];
    this.providerMap.forEach((provider) => {
      providers.push(provider.instance);
    });
    return providers;
  }

  getDependencies() {
    const dependencies = Array.from(this.providerMap.values());
    this.dependencyMap.forEach((dependency, provide) => {
      if (!this.providerMap.has(provide)) {
        dependencies.push(dependency);
      }
    });
    return dependencies;
  }

  destroy() {
    this.providerMap.forEach((provider) => {
      providerToModuleRegistryMap.delete(provider.instance);
      if (provider.basicProvider.providedIn === ProvidedInType.PLATFORM) {
        deletePlatformProvider(provider);
      }
    });
  }
}
