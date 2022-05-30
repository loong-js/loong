import { proxyToRawMap } from '../observable';

export function isObservable(target: unknown) {
  return proxyToRawMap.has(target);
}
