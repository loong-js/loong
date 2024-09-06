import { Context, createContext } from 'react';

declare global {
  interface Window {
    __LOONG_BIND_CONTEXT__: Context<IBindContextValue>;
  }
}

export interface IBindContextValue<T = any> {
  dependencies: any[];
  $this: T;
}

if (!window.__LOONG_BIND_CONTEXT__) {
  window.__LOONG_BIND_CONTEXT__ = createContext<IBindContextValue>({
    dependencies: [],
    $this: null,
  });
}

export const BindContext = window.__LOONG_BIND_CONTEXT__;
