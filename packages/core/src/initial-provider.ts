// Classes may be used during constructor initialization.
let initialProvider: any = null;

export function setInitialProvider(provider: any) {
  initialProvider = provider;
}

export function resetInitialProvider() {
  initialProvider = null;
}

export function getInitialProvider() {
  return initialProvider;
}
