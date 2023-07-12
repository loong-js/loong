import { Handler } from '.';
import { createAction } from '../action';
import { config } from '../config';
import { TrackOperationType, TriggerOperationType } from '../constants/operation-type';
import { proxyToRawMap } from '../observable';
import { Key, track, trigger } from '../reaction';
import { findObservable } from '../utils/find-observable';
import { hasChanged } from '../utils/has-changed';
import { hasOwnProperty } from '../utils/has-own-property';
import { isObject } from '../utils/is-object';

export const baseHandler: Handler = {
  get(target, key: Key, receiver: object) {
    const result = Reflect.get(target, key, receiver);

    track(target, TrackOperationType.GET, key);

    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);

    if (descriptor && descriptor.writable === false && descriptor.configurable === false) {
      return result;
    }

    if (config.checkAction?.(result, target, key)) {
      return createAction(target, key, result);
    }

    return findObservable(result);
  },

  has(target: object, key: Key) {
    const result = Reflect.has(target, key);
    track(target, TrackOperationType.HAS, key);
    return result;
  },

  ownKeys(target: object) {
    track(target, TrackOperationType.ITERATE);
    return Reflect.ownKeys(target);
  },

  set(target: object, key: Key, value: unknown, receiver: object) {
    if (isObject(value)) {
      value = proxyToRawMap.get(value) || value;
    }

    const hadKey = hasOwnProperty(target, key);
    const oldValue = (target as any)[key];
    const result = Reflect.set(target, key, value, receiver);

    if (target !== proxyToRawMap.get(receiver)) {
      return result;
    }

    if (!hadKey) {
      trigger(target, TriggerOperationType.ADD, key);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOperationType.SET, key);
    }

    return result;
  },

  deleteProperty(target: object, key: Key) {
    const hadKey = hasOwnProperty(target, key);
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, TriggerOperationType.DELETE, key);
    }
    return result;
  },
};
