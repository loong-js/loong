import { hasBasicProvider, ProviderRegistry } from './provider-registry';
import {
  IProviderConstructor,
  ModuleRegistryOptions,
  MODULE_TARGET_TYPE,
  ProvidedInType,
  Providers,
} from './annotations/module';
import { Hooks } from './hooks';
import { Watchers } from './watchers';
import { error } from './utils/error';

export const providerToModuleRegistryMap = new WeakMap<any, ModuleRegistry>();

const INITIALIZE_IMPORT_MODULE_OPTIONAL_OPTION_NAMES: string[] = ['observe', 'initialProps'];

export class ModuleRegistry {
  private moduleInstance?: any;

  protected moduleRegistries: ModuleRegistry[] = [];

  providerRegistry: ProviderRegistry;

  hooks: Hooks;

  watchers: Watchers;

  constructor(private module: IProviderConstructor, private options: ModuleRegistryOptions) {
    this.initializeProviders();

    this.providerRegistry = new ProviderRegistry(module, options, (providerRegistry) => {
      if (!options.imports?.length) {
        return;
      }
      const newOptions = INITIALIZE_IMPORT_MODULE_OPTIONAL_OPTION_NAMES.reduce(
        (resultOptions, name) => {
          resultOptions[name] = (options as Record<string, unknown>)[name];
          return resultOptions;
        },
        {} as Record<string, unknown>
      );
      // After registration, initialize the imported module of imports.
      options.imports.forEach((importModule) => {
        const moduleRegistry = importModule.create?.({
          ...newOptions,
          useProvidedIn: true,
          dependencies: providerRegistry.getDependencies(),
        });
        if (moduleRegistry) {
          providerRegistry.setProviderInstance(importModule, moduleRegistry.getModule());
          this.moduleRegistries.push(moduleRegistry);
        }
      });
    });
    this.moduleInstance = this.getModule();

    const providers = this.providerRegistry.getProviders();
    providers.forEach((provider) => providerToModuleRegistryMap.set(provider, this));

    if (options.observable) {
      this.providerRegistry.setProviderInstance(module, options.observable(this.moduleInstance));
    }

    this.hooks = new Hooks(providers);
    this.watchers = new Watchers(providers, options.observe);
    this.watchers.createWatchers();
  }

  private initializeProviders() {
    const options = this.options;
    // If useProvidedIn is passed in, it means the module imported by imports.
    // At this time, all but self type providers have been instantiated.
    if (this.options.useProvidedIn) {
      options.providers = options.providers?.filter(
        (provider) => hasBasicProvider(provider) && provider.providedIn === ProvidedInType.SELF
      );
    }

    if (options.imports?.length) {
      const providers: Providers = [];
      options.imports.forEach((importModule) => {
        if (this.constructor === ModuleRegistry && importModule.type !== MODULE_TARGET_TYPE) {
          error(
            `Module imports only receive module annotated classes, and '${this.module.name}' receives other annotated classes`
          );
        }
        importModule.options?.providers?.forEach((importModuleProvider) => {
          if (hasBasicProvider(importModuleProvider)) {
            if (
              !importModuleProvider.providedIn ||
              importModuleProvider.providedIn === ProvidedInType.ROOT
            ) {
              providers.push(importModuleProvider);
            }
          } else {
            providers.push(importModuleProvider);
          }
        });
      });
      options.providers = [...providers, ...(options.providers || [])];
    }
  }

  getModule() {
    return this.providerRegistry.getProvider(this.module);
  }

  destroy() {
    this.moduleRegistries.forEach((moduleRegistry) => moduleRegistry.destroy());
    this.providerRegistry.destroy();
    // providerToModuleRegistryMap.delete(this.moduleInstance);
    this.watchers.destroy();
    this.hooks.destroy();
  }
}
