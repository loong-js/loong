import { ProviderRegistry } from './provider-registry';

// Classes may be used during constructor initialization.
let initialProviderRegistry: ProviderRegistry | null = null;

export function setInitialProviderRegistry(providerRegistry: ProviderRegistry) {
  initialProviderRegistry = providerRegistry;
}

export function resetInitialProviderRegistry() {
  initialProviderRegistry = null;
}

export function getInitialProviderRegistry() {
  return initialProviderRegistry;
}
