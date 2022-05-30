export const injectableTargetMap = new WeakMap<Function, true>();

export function Injectable(): ClassDecorator {
  return <T extends Function>(target: T) => {
    injectableTargetMap.set(target, true);
    return target;
  };
}
