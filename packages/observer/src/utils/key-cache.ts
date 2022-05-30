// target - 1:n > key - 1:1 > cache object

import { Key } from '../reaction';

/**
 * {
 *   [target 1]: {
 *     [key 1]: {
 *       [cache key 1]: any
 *     }
 *   }
 * }
 */
type KeyToCache = Map<unknown, Record<Key, any>>;

const targetToKeysMap = new WeakMap<object, KeyToCache>();

export function getKeyCache<T = any>(target: object, key: unknown, cacheKey: Key): T | undefined {
  const keys = targetToKeysMap.get(target);
  if (!keys) {
    return undefined;
  }
  const keyToCache = keys.get(key);
  if (!keyToCache) {
    return undefined;
  }
  return keyToCache[cacheKey];
}

export function setKeyCache(target: object, key: unknown, cache: object) {
  let keys = targetToKeysMap.get(target);
  if (!keys) {
    keys = new Map();
    targetToKeysMap.set(target, keys);
  }
  const keyToCache = keys.get(key);
  keys.set(key, {
    ...keyToCache,
    ...cache,
  });
}

export function hasKeyCache(target: object, key: unknown, cacheKey: Key): boolean {
  const keys = targetToKeysMap.get(target);
  if (!keys) {
    return false;
  }
  const keyToCache = keys.get(key);
  if (!keyToCache) {
    return false;
  }
  return keyToCache[cacheKey] !== undefined;
}
