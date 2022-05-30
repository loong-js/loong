import { Handler } from '.';
import { TrackOperationType, TriggerOperationType } from '../constants/operation-type';
import { proxyToRawMap } from '../observable';
import { Key, track, trigger } from '../reaction';
import { findObservable } from '../utils/find-observable';
import { getPrototypeOf } from '../utils/get-prototype-of';
import { hasChanged } from '../utils/has-changed';
import { hasOwnProperty } from '../utils/has-own-property';

export type CollectionType = IterableCollection | WeakCollection;

type IterableCollection = Map<any, any> | Set<any>;
type WeakCollection = WeakMap<any, any> | WeakSet<any>;
type MapType = Map<any, any> | WeakMap<any, any>;
type SetType = Set<any> | WeakSet<any>;

type MethodName = string | symbol;

function patchIterator(iterator: Iterator<unknown>, isEntriesMethod = false) {
  const originalNext = iterator.next;
  iterator.next = () => {
    // eslint-disable-next-line prefer-const
    let { done, value } = originalNext.call(iterator);
    if (!done) {
      if (isEntriesMethod) {
        value = [findObservable(value[0]), findObservable(value[1])];
      } else {
        value = findObservable(value);
      }
    }
    return { done, value };
  };
  return iterator;
}

function createIterableMethod(methodName: MethodName) {
  return function (this: IterableCollection, ...args: unknown[]) {
    const target = proxyToRawMap.get(this);

    track(target, TrackOperationType.ITERATE);

    const iterator = target[methodName](...args);
    let isEntriesMethod = false;

    if (methodName === 'entries' || (methodName === Symbol.iterator && target instanceof Map)) {
      isEntriesMethod = true;
    }

    return patchIterator(iterator, isEntriesMethod);
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
const instrumentations: Record<MethodName, Function> = {
  has(this: CollectionType, key: unknown) {
    const target = proxyToRawMap.get(this);
    track(target, TrackOperationType.HAS, key);
    return target.has(key);
  },

  get(this: MapType, key: unknown) {
    const target = proxyToRawMap.get(this);
    track(target, TrackOperationType.GET, key);
    return findObservable(target.get(key));
  },

  add(this: SetType, value: unknown) {
    const target = proxyToRawMap.get(this);
    const { has } = getPrototypeOf(target);
    const hadKey = has.call(target, value);

    if (!hadKey) {
      target.add(value);
      trigger(target, TriggerOperationType.ADD, value);
    }

    return this;
  },

  set(this: MapType, key: unknown, value: unknown) {
    const target = proxyToRawMap.get(this);
    const { has, get } = getPrototypeOf(target);
    const hadKey = has.call(target, key);
    const oldValue = get.call(target, key);
    target.set(key, value);

    if (!hadKey) {
      trigger(target, TriggerOperationType.ADD, key);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOperationType.SET, key);
    }

    return this;
  },

  delete(this: CollectionType, key: unknown) {
    const target = proxyToRawMap.get(this);
    const { has } = getPrototypeOf(target);
    const hadKey = has.call(target, key);
    const result = target.delete(key);

    if (result && hadKey) {
      trigger(target, TriggerOperationType.DELETE, key);
    }

    return result;
  },

  clear(this: IterableCollection) {
    const target = proxyToRawMap.get(this);
    const hadItems = target.size !== 0;
    const result = target.clear();

    if (hadItems) {
      trigger(target, TriggerOperationType.CLEAR);
    }

    return result;
  },

  // eslint-disable-next-line @typescript-eslint/ban-types
  forEach(this: IterableCollection, callback: Function, thisArg?: unknown) {
    const target = proxyToRawMap.get(this);
    track(target, TrackOperationType.ITERATE);
    return target.forEach((value: unknown, key: unknown) => {
      return callback.call(thisArg, findObservable(value), findObservable(key), this);
    });
  },

  get size() {
    const target = proxyToRawMap.get(this);
    track(target, TrackOperationType.ITERATE);
    return Reflect.get(target, 'size', target);
  },
};

['keys', 'values', 'entries', Symbol.iterator].forEach((methodName: MethodName) => {
  instrumentations[methodName] = createIterableMethod(methodName);
});

export const collectionHandler: Handler = {
  get(target: object, key: Key, receiver: object) {
    target = hasOwnProperty(instrumentations, key) ? instrumentations : target;
    return Reflect.get(target, key, receiver);
  },
};
