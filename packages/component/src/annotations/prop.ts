import { targetToWatchNameAndKeys } from '@loong-js/core';
import { providerToComponentRegistryMap } from '../component-registry';
import { getInitialProps } from '../initial-props';

function getVirtualPropertyKey(propertyKey: string) {
  return `${propertyKey}@Virtual`;
}

let propGlobalCount = 0;

export function Prop(propName?: string): PropertyDecorator {
  return ((target: any, propertyKey: string, descriptor: IBabelPropertyDescriptor) => {
    const realPropertyKey = propName || propertyKey;
    const virtualPropertyKey = getVirtualPropertyKey(realPropertyKey);
    const watcherKey = `${virtualPropertyKey}Watcher@${propGlobalCount++}`;
    const defaultValue = descriptor?.initializer ? descriptor.initializer() : descriptor?.value;

    // eslint-disable-next-line no-prototype-builtins
    if (!target.hasOwnProperty(virtualPropertyKey)) {
      Object.defineProperty(target, virtualPropertyKey, {
        get(this: any) {
          providerToComponentRegistryMap.get(this)?.watchers.getWatcher()?.checkNeedObservedProps();

          let result: any;
          if (
            !providerToComponentRegistryMap.has(this) ||
            // When initializing the watch, you may get the props.
            // At this time, the props have not been initialized.
            !providerToComponentRegistryMap.get(this)?.props
          ) {
            result = getInitialProps()?.[realPropertyKey];
          } else {
            result = providerToComponentRegistryMap.get(this)?.props.getProp(realPropertyKey);
          }
          if (typeof result === 'undefined') {
            result = defaultValue;
          }
          return result;
        },
      });
    }

    if (!targetToWatchNameAndKeys.has(target.constructor)) {
      targetToWatchNameAndKeys.set(target.constructor, []);
    }

    // Listen for real prop changes to change the value of the set property,
    // which can be observed by the view
    targetToWatchNameAndKeys.get(target.constructor)?.push([
      watcherKey,
      {
        names: [virtualPropertyKey],
      },
    ]);

    Object.defineProperty(target, watcherKey, {
      value() {
        this[propertyKey] = this[virtualPropertyKey];
      },
    });

    return descriptor;
  }) as any;
}
