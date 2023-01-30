import { IProviderConstructor } from '../';
import { error } from '../utils/error';

export interface IWatchParameters {
  predicate?: Predicate;
  names?: string[];
}

export const targetToWatchNameAndKeys = new WeakMap<
  IProviderConstructor,
  [string | symbol, IWatchParameters][]
>();

export type Predicate<T = any> = ($this: T) => boolean | (keyof T)[];

export function Watch(predicate: Predicate): MethodDecorator;
export function Watch(name: string, ...names: string[]): MethodDecorator;
export function Watch(predicateOrName: Predicate | string, ...names: string[]): MethodDecorator {
  if (!predicateOrName) {
    error('Watch must accept a parameter');
  }

  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (!targetToWatchNameAndKeys.has(target.constructor)) {
      targetToWatchNameAndKeys.set(target.constructor, []);
    }
    const parameters: IWatchParameters = {};
    if (typeof predicateOrName === 'function') {
      parameters.predicate = predicateOrName;
    } else {
      parameters.names = [predicateOrName, ...names];
    }
    targetToWatchNameAndKeys.get(target.constructor)?.push([propertyKey, parameters]);

    return descriptor;
  };
}
