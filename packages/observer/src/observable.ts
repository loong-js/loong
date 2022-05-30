import { OPTIONS } from './constants/key-cache';
import { getTargetType, TargetType } from './constants/target-type';
import { baseHandler, collectionHandler } from './handlers';
import { Key } from './reaction';
import { isObject } from './utils/is-object';
import { isObservable } from './utils/is-observable';
import { setKeyCache } from './utils/key-cache';
import { warn } from './utils/warn';

export const rawToProxyMap = new WeakMap<any, any>();

export const proxyToRawMap = new WeakMap<any, any>();

export type CheckActionType = (result: Function, target: object, key: Key) => boolean;

export interface IObservableOptions {
  autoBind?: boolean;
  strict?: boolean;
  checkAction?: CheckActionType;
}

export function observable<T extends object>(target: T, options?: IObservableOptions): T {
  // If it is already observable, return the target directly.
  if (isObservable(target)) {
    return target;
  }

  return createObservable(target, options);
}

function createObservable(target: object, options?: IObservableOptions) {
  if (!isObject(target)) {
    warn(`${target} cannot be made observable`);
    return target;
  }
  const existingProxy = rawToProxyMap.get(target);

  if (existingProxy) {
    return existingProxy;
  }

  const targetType = getTargetType(target);

  if (targetType === TargetType.INVALID) {
    return target;
  }

  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandler : baseHandler
  );

  rawToProxyMap.set(target, proxy);
  proxyToRawMap.set(proxy, target);

  if (options) {
    setKeyCache(target, OPTIONS, options);
  }

  return proxy;
}
