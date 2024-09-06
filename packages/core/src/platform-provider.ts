import { PollingControlCenter } from '@loong-js/shared';
import { Provide, IProviderConstructor } from './annotations/module';
import { IProvider, ProviderStatus } from './provider-registry';

type ReturnProviderInstance<T> = T extends IProviderConstructor ? ClassInstance<T> : any;

interface IWaitForPlatformProviderOptions {
  timeout?: number;
}

declare global {
  interface Window {
    __LOONG_PLATFORM_PROVIDER_MAP__: WeakMap<Provide, IProvider>;
    __LOONG_POLLING_CONTROL_CENTER__: PollingControlCenter;
  }
}

if (!window.__LOONG_PLATFORM_PROVIDER_MAP__ || !window.__LOONG_POLLING_CONTROL_CENTER__) {
  window.__LOONG_PLATFORM_PROVIDER_MAP__ = new WeakMap();
  window.__LOONG_POLLING_CONTROL_CENTER__ = new PollingControlCenter({
    interval: 100,
    leading: true,
    autorun: true,
  });
}

const platformProviderMap = window.__LOONG_PLATFORM_PROVIDER_MAP__;
const pollingControlCenter = window.__LOONG_POLLING_CONTROL_CENTER__;

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
