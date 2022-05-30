import { proxyToRawMap } from '../observable';

export function raw<T>(proxy: T): T {
  return proxyToRawMap.get(proxy) || proxy;
}
