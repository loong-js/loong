import { prototypeToString } from './to-string';

export function isPlainObject(obj: any): boolean {
  return prototypeToString.call(obj) === '[object Object]';
}
