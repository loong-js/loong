import { IProviderConstructor } from '../';

export const targetToHookNameAndKeys = new WeakMap<IProviderConstructor, [string, string][]>();

export function Hook<T extends keyof LoongCore.IHookParameters>(hookName?: T) {
  return (
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<LoongCore.IHookParameters[T]>
  ) => {
    if (!targetToHookNameAndKeys.has(target.constructor)) {
      targetToHookNameAndKeys.set(target.constructor, []);
    }
    targetToHookNameAndKeys.get(target.constructor)?.push([hookName || key, key]);

    return descriptor;
  };
}
