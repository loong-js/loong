import { IProviderConstructor } from '../';
import { error } from '../utils/error';

export interface IWatchParameters {
  predicate?: Predicate;
  names?: string[];
  options?: IWatchOptions;
}

export enum WatchFlushType {
  // data changes trigger updates immediately
  SYNC = 'sync',
  // triggers an update after the view is updated
  POST = 'post',
}

export interface IWatchOptions {
  flush?: Lowercase<keyof typeof WatchFlushType>;
}

export const targetToWatchNameAndKeys = new WeakMap<
  IProviderConstructor,
  [string | symbol, IWatchParameters][]
>();

export type Predicate<T = any> = ($this: T) => boolean | (keyof T)[];

export function Watch(predicate: Predicate, options?: IWatchOptions): MethodDecorator;
export function Watch(name: string, ...names: (string | IWatchOptions)[]): MethodDecorator;
export function Watch(
  predicateOrName: Predicate | string,
  ...nameOrOptions: (string | IWatchOptions | undefined)[]
): MethodDecorator {
  if (!predicateOrName) {
    error('Watch must accept a parameter');
  }

  const names: string[] = [];
  let options: IWatchOptions = {};

  nameOrOptions.forEach((nameOrOption) => {
    if (typeof nameOrOption === 'string') {
      names.push(nameOrOption);
    } else if (nameOrOption !== null && typeof nameOrOption === 'object') {
      options = {
        ...options,
        ...nameOrOption,
      };
    }
  });

  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (!targetToWatchNameAndKeys.has(target.constructor)) {
      targetToWatchNameAndKeys.set(target.constructor, []);
    }
    const parameters: IWatchParameters = {
      options,
    };
    if (typeof predicateOrName === 'function') {
      parameters.predicate = predicateOrName;
    } else {
      parameters.names = [predicateOrName, ...names];
    }
    targetToWatchNameAndKeys.get(target.constructor)?.push([propertyKey, parameters]);

    return descriptor;
  };
}
