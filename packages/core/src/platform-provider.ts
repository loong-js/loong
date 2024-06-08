import { PollingControlCenter } from '@loong-js/shared';
import { Provide, IProviderConstructor } from './annotations/module';
import { IProvider, ProviderStatus } from './provider-registry';

type ReturnProviderInstance<T> = T extends IProviderConstructor ? ClassInstance<T> : any;

interface IWaitForPlatformProviderOptions {
  timeout?: number;
}

const platformProviderMap = new WeakMap<Provide, IProvider>();

const pollingControlCenter = new PollingControlCenter({
  interval: 100,
  leading: true,
  autorun: true,
});

export function setPlatformProvider(provider: IProvider) {
  platformProviderMap.set(provider.basicProvider.provide, provider);
}

export function deletePlatformProvider(provider: IProvider) {
  platformProviderMap.delete(provider.basicProvider.provide);
}

export function getPlatformProvider<T extends Provide>(
  provide: T
): ReturnProviderInstance<T> | undefined {
  const provider = platformProviderMap.get(provide);
  if (!provider || provider.status === ProviderStatus.UNINSTALLED) {
    return;
  }
  return platformProviderMap.get(provide)?.instance;
}

export function waitForVariable<T extends () => any>(
  value: T,
  options?: IWaitForPlatformProviderOptions
): Promise<ReturnType<T>> {
  return new Promise((resolve, reject) => {
    let done = false;
    let instance: ReturnProviderInstance<T> | undefined;

    pollingControlCenter.addTask({
      interval: 100,
      timeout: options?.timeout,
      task: () => {
        try {
          instance = value();
        } catch (error) {
          done = true;
          reject(error);
          return;
        }
        if (instance) {
          done = true;
          resolve(instance);
        }
      },
      checkDone: () => done,
    });
  });
}

export function waitForPlatformProvider<T extends Provide>(
  provide: T,
  options?: IWaitForPlatformProviderOptions
): Promise<ReturnProviderInstance<T>> {
  return waitForVariable(() => getPlatformProvider(provide) as ReturnProviderInstance<T>, options);
}
