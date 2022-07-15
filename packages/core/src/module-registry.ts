import { ProviderRegistry } from './provider-registry';
import { IProviderConstructor, ModuleRegistryOptions } from './annotations/module';

export const providerToModuleRegistryMap = new WeakMap<any, ModuleRegistry>();

export class ModuleRegistry {
  providerRegistry: ProviderRegistry;

  constructor(private module: IProviderConstructor, private options: ModuleRegistryOptions) {
    this.providerRegistry = new ProviderRegistry(module, options);
    const providers = this.providerRegistry.getProviders();
    providers.forEach((provider) => providerToModuleRegistryMap.set(provider, this));
  }

  getModule() {
    return this.providerRegistry.getProvider(this.module);
  }

  destroy() {
    this.providerRegistry
      .getProviders()
      .forEach((provider) => providerToModuleRegistryMap.delete(provider));
  }
}
