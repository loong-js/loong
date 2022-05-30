import { toTypeString } from '../utils/to-type-string';

export enum TargetType {
  INVALID,
  COMMON,
  COLLECTION,
}

export function getTargetType(target: object): TargetType {
  if (!Object.isExtensible(target)) {
    return TargetType.INVALID;
  }

  const typeString = toTypeString(target).slice(8, -1);

  switch (typeString) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON;
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION;
    default:
      return TargetType.INVALID;
  }
}
