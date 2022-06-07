import { resetInitialProps, setInitialProps } from './initial-props';
import { ProviderRegistry } from './provider-registry';
import { Props } from './props';
import { Hooks } from './hooks';
import { ComponentRegistryOptions, IProviderConstructor } from './annotations/component';
import { Watchers } from './watchers';

export const providerToComponentRegistryMap = new WeakMap<any, ComponentRegistry>();

export class ComponentRegistry {
  providerRegistry: ProviderRegistry;

  props: Props;

  hooks: Hooks;

  watchers: Watchers;

  constructor(private component: IProviderConstructor, private options: ComponentRegistryOptions) {
    setInitialProps(options.initialProps);
    this.providerRegistry = new ProviderRegistry(component, options);
    resetInitialProps();
    const providers = this.providerRegistry.getProviders();
    providers.forEach((provider) => providerToComponentRegistryMap.set(provider, this));
    this.hooks = new Hooks(providers);
    this.props = new Props(options.initialProps, () => this.watchers);
    this.watchers = new Watchers(providers, options.observe);
    this.watchers.createWatchers();
  }

  getComponent() {
    return this.providerRegistry.getProvider(this.component);
  }

  destroy() {
    this.providerRegistry
      .getProviders()
      .forEach((provider) => providerToComponentRegistryMap.delete(provider));
    this.watchers.destroy();
  }
}
