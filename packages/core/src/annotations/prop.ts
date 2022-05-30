import { providerToComponentRegistryMap } from '../component-registry';
import { getInitialProps } from '../initial-props';

export function Prop(propName?: string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    propertyKey = propName || propertyKey;

    return {
      get(this: any) {
        if (!providerToComponentRegistryMap.has(this)) {
          return getInitialProps()?.[propertyKey];
        }
        providerToComponentRegistryMap.get(this)?.watchers.getWatcher()?.checkNeedObservedProps();
        return providerToComponentRegistryMap.get(this)?.props.getProp(propertyKey);
      },
    };
  };
}
