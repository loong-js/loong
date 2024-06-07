import { Provide, IProviderConstructor } from './annotations/module';
import { IProvider, ProviderStatus } from './provider-registry';

const platformProviderMap = new WeakMap<Provide, IProvider>();

export function setPlatformProvider(provider: IProvider) {
  platformProviderMap.set(provider.basicProvider.provide, provider);
}

export function deletePlatformProvider(provider: IProvider) {
  provider.status = ProviderStatus.UNINSTALLED;
  delete provider.instance;
  platformProviderMap.delete(provider.basicProvider.provide);
}

export function getPlatformProvider<T extends Provide>(
  provide: T
): (T extends IProviderConstructor ? ClassInstance<T> : any) | undefined {
  const provider = platformProviderMap.get(provide);
  if (!provider || provider.status === ProviderStatus.UNINSTALLED) {
    return;
  }
  return platformProviderMap.get(provide)?.instance;
}
