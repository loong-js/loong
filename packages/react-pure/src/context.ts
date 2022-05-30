import { createContext } from 'react';

export interface IBindContextValue<T = any> {
  dependencies: any[];
  $this: T;
}

export const BindContext = createContext<IBindContextValue>({
  dependencies: [],
  $this: null,
});
