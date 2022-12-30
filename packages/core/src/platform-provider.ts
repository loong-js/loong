import { Provide } from './annotations/module';
import { IProvider } from './provider-registry';

const platformProviderMap = new WeakMap<Provide, IProvider>();

export function setPlatformProvider(provider: IProvider) {
  platformProviderMap.set(provider.basicProvider.provide, provider);
}

export function deletePlatformProvider(provider: IProvider) {
  platformProviderMap.delete(provider.basicProvider.provide);
}

export function getPlatformProvider(provide: Provide) {
  return platformProviderMap.get(provide)?.instance;
}
