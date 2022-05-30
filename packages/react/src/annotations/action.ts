export const actionMap = new WeakMap<Function, true>();

export function Action() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (descriptor.value) {
      actionMap.set(descriptor.value, true);
    }

    return descriptor;
  };
}
