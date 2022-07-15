import { resetInitialProps, setInitialProps } from './initial-props';
import { Props } from './props';
import { Hooks } from './hooks';
import { ComponentRegistryOptions } from './annotations/component';
import { Watchers } from './watchers';
import { ModuleRegistry } from './module-registry';
import { IProviderConstructor } from './annotations/module';

export const providerToComponentRegistryMap = new WeakMap<any, ComponentRegistry>();

export class ComponentRegistry {
  moduleRegistry: ModuleRegistry;

  props: Props;

  hooks: Hooks;

  watchers: Watchers;

  constructor(private component: IProviderConstructor, private options: ComponentRegistryOptions) {
    setInitialProps(options.initialProps);
    this.moduleRegistry = new ModuleRegistry(component, options);
    resetInitialProps();
    if (options.observable) {
      this.moduleRegistry.providerRegistry.setProviderInstance(
        component,
        options.observable(this.getComponent())
      );
    }
    const providers = this.moduleRegistry.providerRegistry.getProviders();
    this.hooks = new Hooks(providers);
    this.props = new Props(options.initialProps, () => this.watchers);
    this.watchers = new Watchers(providers, options.observe);
    this.watchers.createWatchers();
  }

  getComponent() {
    return this.moduleRegistry.getModule();
  }

  destroy() {
    this.moduleRegistry.providerRegistry
      .getProviders()
      .forEach((provider) => providerToComponentRegistryMap.delete(provider));
    this.watchers.destroy();
  }
}
