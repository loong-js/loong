import { CollectionType } from '../handlers/collection-handler';

export function getPrototypeOf<T extends CollectionType>(target: T): any {
  return Reflect.getPrototypeOf(target);
}
