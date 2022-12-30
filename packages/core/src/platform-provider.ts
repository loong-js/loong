import { Provide, IProviderConstructor } from './annotations/module';
import { IProvider } from './provider-registry';

const platformProviderMap = new WeakMap<Provide, IProvider>();

export function setPlatformProvider(provider: IProvider) {
  platformProviderMap.set(provider.basicProvider.provide, provider);
}

export function deletePlatformProvider(provider: IProvider) {
  platformProviderMap.delete(provider.basicProvider.provide);
}

export function getPlatformProvider<T extends Provide>(
  provide: T
): (T extends IProviderConstructor ? ClassInstance<T> : any) | undefined {
  return platformProviderMap.get(provide)?.instance;
}
