import { IProviderConstructor, ModuleRegistry, providerToModuleRegistryMap } from '@loong-js/core';
import { ComponentRegistryOptions } from './annotations/component';
import { resetInitialProps, setInitialProps } from './initial-props';
import { Props } from './props';

export const providerToComponentRegistryMap = providerToModuleRegistryMap as Map<
  any,
  ComponentRegistry
>;

export class ComponentRegistry extends ModuleRegistry {
  private componentRegistries: ComponentRegistry[] = [];

  props: Props;

  constructor(private component: IProviderConstructor, options: ComponentRegistryOptions) {
    setInitialProps(options.initialProps);
    super(component, options);
    resetInitialProps();
    this.componentRegistries = this.moduleRegistries.filter(
      (moduleRegistry) => moduleRegistry instanceof ComponentRegistry
    ) as ComponentRegistry[];
    this.props = new Props(options.initialProps, (props) => {
      this.componentRegistries.forEach((componentRegistry) => {
        componentRegistry.props.setProps(props);
      });
      this.watchers.watchAfterCheckObservedProps();
    });
  }

  getComponent() {
    return this.getModule();
  }
}
