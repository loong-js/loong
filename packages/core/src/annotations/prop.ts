import { providerToComponentRegistryMap } from '../component-registry';
import { getInitialProps } from '../initial-props';

export function Prop(propName?: string): PropertyDecorator {
  return ((target: object, propertyKey: string | symbol, descriptor: IBabelPropertyDescriptor) => {
    propertyKey = propName || propertyKey;
    const defaultValue = descriptor?.initializer ? descriptor.initializer() : descriptor?.value;

    return {
      get(this: any) {
        let result: any;
        if (!providerToComponentRegistryMap.has(this)) {
          result = getInitialProps()?.[propertyKey];
        } else {
          providerToComponentRegistryMap.get(this)?.watchers.getWatcher()?.checkNeedObservedProps();
          result = providerToComponentRegistryMap.get(this)?.props.getProp(propertyKey);
        }
        if (typeof result === 'undefined') {
          result = defaultValue;
        }
        return result;
      },
    };
  }) as any;
}
