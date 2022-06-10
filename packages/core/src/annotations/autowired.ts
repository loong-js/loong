import { providerToComponentRegistryMap } from '../component-registry';
import { resolveForwardRef } from '../forward-ref';
import { getInitialProvider } from '../initial-provider';
import { getInitialProviderRegistry } from '../initial-provider-registry';

export function Autowired(): PropertyDecorator {
  return ((target: object, propertyKey: string | symbol, descriptor: IBabelPropertyDescriptor) => {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    const defaultValue = descriptor?.initializer ? descriptor.initializer() : descriptor?.value;
    let provider: any;

    return {
      get(this: any) {
        if (provider) {
          return provider;
        }
        const providerType = resolveForwardRef(defaultValue?.()) || type;
        const Provider = getInitialProvider();
        const providerRegistry =
          providerToComponentRegistryMap.get(this)?.moduleRegistry.providerRegistry ||
          getInitialProviderRegistry();
        if (Provider) {
          providerRegistry?.registerProvider(providerType, Provider);
        }
        provider = providerRegistry?.getProvider(providerType);
        return provider;
      },
    };
  }) as any;
}
