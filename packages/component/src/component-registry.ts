import { ModuleRegistry, providerToModuleRegistryMap, IProviderConstructor } from '@loong-js/core';
import { resetInitialProps, setInitialProps } from './initial-props';
import { Props } from './props';
import { Hooks } from './hooks';
import { ComponentRegistryOptions } from './annotations/component';
import { Watchers } from './watchers';

export const providerToComponentRegistryMap = providerToModuleRegistryMap as Map<
  any,
  ComponentRegistry
>;

export class ComponentRegistry extends ModuleRegistry {
  props: Props;

  hooks: Hooks;

  watchers: Watchers;

  constructor(private component: IProviderConstructor, options: ComponentRegistryOptions) {
    setInitialProps(options.initialProps);
    super(component, options);
    resetInitialProps();
    if (options.observable) {
      this.providerRegistry.setProviderInstance(component, options.observable(this.getComponent()));
    }
    const providers = this.providerRegistry.getProviders();
    this.hooks = new Hooks(providers);
    this.props = new Props(options.initialProps, () => this.watchers);
    this.watchers = new Watchers(providers, options.observe);
    this.watchers.createWatchers();
  }

  getComponent() {
    return this.getModule();
  }
}
