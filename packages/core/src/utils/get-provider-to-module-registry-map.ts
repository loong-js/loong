import type { ModuleRegistry } from '..';

declare global {
  interface Window {
    __LOONG_PROVIDER_TO_MODULE_REGISTRY_MAP__: WeakMap<any, ModuleRegistry>;
  }
}

// fixed an issue with access between multiple projects
if (!window.__LOONG_PROVIDER_TO_MODULE_REGISTRY_MAP__) {
  window.__LOONG_PROVIDER_TO_MODULE_REGISTRY_MAP__ = new WeakMap();
}

export const providerToModuleRegistryMap = window.__LOONG_PROVIDER_TO_MODULE_REGISTRY_MAP__;
