import {
  ComponentRegistryOptions,
  IProviderConstructor,
  Provider,
  IClassProvider,
} from './annotations/component';
import { injectableTargetMap } from './annotations/injectable';
import { resetInitialProvider, setInitialProvider } from './initial-provider';
import { setInitialProviderRegistry } from './initial-provider-registry';
import { error } from './utils/error';

// Prevent circular dependency.
enum ProviderStatus {
  INSTANTIATING,
  INSTANTIATED,
}

interface IProvider {
  status: ProviderStatus;
  instance?: any;
}

function hasUseClass(provider: Provider): provider is IClassProvider {
  return (
    typeof provider === 'object' &&
    provider.provide &&
    provider.useClass &&
    provider.provide !== provider.useClass
  );
}

export class ProviderRegistry {
  private providerMap = new Map<IProviderConstructor, IProvider>();

  private dependencyMap = new Map<IProviderConstructor, any>();

  // Create a path that allows the provider to find its corresponding actual provider.
  private providerToClassProvider = new Map<
    IProviderConstructor | Function,
    IProviderConstructor
  >();

  private providerInstances: any[] = [];

  private get providers() {
    return this.options.providers || [];
  }

  private get dependencies() {
    return this.options.dependencies || [];
  }

  constructor(private component: IProviderConstructor, private options: ComponentRegistryOptions) {
    setInitialProviderRegistry(this);
    this.initializeMap();
    this.registerProviders(this.providers);
    this.registerProvider(component);
    this.providerMap.forEach((provider) => this.providerInstances.push(provider?.instance));
    resetInitialProvider();
  }

  private initializeMap() {
    this.dependencies.forEach((dependency) =>
      this.dependencyMap.set(dependency.constructor, dependency)
    );
  }

  registerProvider(provider: Provider, instantiatingProvider?: IProviderConstructor) {
    let Provider: IProviderConstructor | null = null;

    // Add a path only if the provider is different from the actual provider.
    if (hasUseClass(provider)) {
      Provider = provider.useClass;
      this.providerToClassProvider.set(provider.provide, provider.useClass);
    } else if (typeof provider === 'function') {
      Provider = provider;
    }

    if (!Provider) {
      return;
    }

    // Check whether the provider is registered with injectable.
    if (this.component !== Provider && !injectableTargetMap.has(Provider)) {
      error(`${Provider.name} is not registered with injectable`);
    }

    if (this.providerMap.get(Provider)?.status === ProviderStatus.INSTANTIATED) {
      return;
    }

    if (this.providerMap.get(Provider)?.status === ProviderStatus.INSTANTIATING) {
      error(
        `Circular dependency found ${Provider.name} -> ${instantiatingProvider?.name} -> ${Provider.name}`
      );
    }

    this.providerMap.set(Provider, {
      status: ProviderStatus.INSTANTIATING,
    });

    const paramtypes: IProviderConstructor[] =
      Reflect.getMetadata('design:paramtypes', Provider) || [];
    // Register dependent providers first.
    this.registerProviders(
      paramtypes
        .map((paramtype) => this.getProviderType(paramtype))
        .filter(
          (provider) =>
            !!this.providers.find((item) =>
              hasUseClass(item) ? item.provide === provider : item === provider
            )
        ),
      Provider
    );

    setInitialProvider(Provider);
    let instance = new Provider(...paramtypes.map((paramtype) => this.getProvider(paramtype)));
    resetInitialProvider();

    if (this.options.observable) {
      instance = this.options.observable(instance);
    }

    this.providerMap.set(Provider, {
      instance,
      status: ProviderStatus.INSTANTIATED,
    });
  }

  private registerProviders(providers: Provider[], instantiatingProvider?: IProviderConstructor) {
    providers.forEach((provider: any) => {
      this.registerProvider(provider, instantiatingProvider);
    });
  }

  private getProviderType(provider: IProviderConstructor) {
    return this.providerToClassProvider.has(provider)
      ? (this.providerToClassProvider.get(provider) as IProviderConstructor)
      : provider;
  }

  getProvider(provider: IProviderConstructor) {
    provider = this.getProviderType(provider);
    return this.providerMap.get(provider)?.instance || this.dependencyMap.get(provider);
  }

  getProviders() {
    return this.providerInstances;
  }

  getDependencies() {
    const providerInstances = [...this.providerInstances];
    this.dependencies.forEach((provider) => {
      const match = providerInstances.find((item) => item === provider.constructor);
      if (!match) {
        providerInstances.push(provider);
      }
    });
    return providerInstances;
  }
}
