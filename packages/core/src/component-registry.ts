import { setInitialProps } from './initial-props';
import { ProviderRegistry } from './provider-registry';
import { Props } from './props';
import { Hooks } from './hooks';
import { ComponentRegistryOptions, IProviderConstructor } from './annotations/component';
import { Watchers } from './watchers';

export const providerToComponentRegistryMap = new WeakMap<any, ComponentRegistry>();

export class ComponentRegistry {
  private providerRegistry: ProviderRegistry;

  public props: Props;

  public hooks: Hooks;

  public watchers: Watchers;

  constructor(private component: IProviderConstructor, private options: ComponentRegistryOptions) {
    setInitialProps(options.initialProps);
    this.providerRegistry = new ProviderRegistry(component, options);
    const providers = this.getProviders();
    providers.forEach((provider) => providerToComponentRegistryMap.set(provider, this));
    this.hooks = new Hooks(providers);
    this.props = new Props(options.initialProps, () => this.watchers);
    this.watchers = new Watchers(providers, options.observe);
    this.watchers.createWatchers();
  }

  getProviders() {
    return this.providerRegistry.getProviders();
  }

  getDependencies() {
    return this.providerRegistry.getDependencies();
  }

  getProvider(provider: IProviderConstructor) {
    return this.providerRegistry.getProvider(provider);
  }

  getComponent() {
    return this.getProvider(this.component);
  }

  destroy() {
    this.getProviders().forEach((provider) => providerToComponentRegistryMap.delete(provider));
    this.watchers.destroy();
  }
}
