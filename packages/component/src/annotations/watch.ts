import { error } from '../utils/error';
import { IProviderConstructor } from '@loong-js/core';

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
export function Watch(predicateOrNames: Predicate | string, ...names: string[]): MethodDecorator {
  if (!predicateOrNames) {
    error('Watch must accept a parameter');
  }

  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (!targetToWatchNameAndKeys.has(target.constructor)) {
      targetToWatchNameAndKeys.set(target.constructor, []);
    }
    const parameters: IWatchParameters = {};
    if (typeof predicateOrNames === 'function') {
      parameters.predicate = predicateOrNames;
    } else {
      parameters.names = [predicateOrNames, ...names];
    }
    targetToWatchNameAndKeys.get(target.constructor)?.push([propertyKey, parameters]);

    return descriptor;
  };
}
