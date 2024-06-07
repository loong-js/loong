import { providerToComponentRegistryMap } from '../component-registry';
import { getInitialProps } from '../initial-props';

export function Prop(propName?: string): PropertyDecorator {
  return ((target: object, propertyKey: string | symbol, descriptor: IBabelPropertyDescriptor) => {
    propertyKey = propName || propertyKey;
    const defaultValue = descriptor?.initializer ? descriptor.initializer() : descriptor?.value;

    return {
      get(this: any) {
        const componentRegistry = providerToComponentRegistryMap.get(this);

        if (!componentRegistry?.destroyed) {
          componentRegistry?.watchers?.getWatcher?.()?.checkNeedObservedProps?.();
        }

        let result: any;
        if (
          !componentRegistry ||
          componentRegistry.destroyed ||
          // When initializing the watch, you may get the props.
          // At this time, the props have not been initialized.
          !componentRegistry?.props
        ) {
          result = getInitialProps()?.[propertyKey];
        } else {
          result = componentRegistry?.props.getProp(propertyKey);
        }
        if (typeof result === 'undefined') {
          result = defaultValue;
        }
        return result;
      },
    };
  }) as any;
}
