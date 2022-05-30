import { observable } from '..';
import { rawToProxyMap } from '../observable';
import { hasRunningReaction } from '../reaction';
import { isObject } from './is-object';

export function findObservable<T>(result: T): T {
  const observableResult = rawToProxyMap.get(result);

  if (hasRunningReaction() && isObject(result)) {
    if (observableResult) {
      return observableResult;
    }
    return observable(result);
  }

  return observableResult || result;
}
