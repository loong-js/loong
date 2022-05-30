import { providerToComponentRegistryMap } from '../component-registry';

export function Autowired(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const type = Reflect.getMetadata('design:type', target, propertyKey);

    return {
      get(this: any) {
        return providerToComponentRegistryMap.get(this)?.getProvider(type);
      },
    };
  };
}
