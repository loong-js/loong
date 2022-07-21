import { observable, observe, unobserve } from '@loong-js/observer';
import { IObservableOptions } from '@loong-js/observer';
import { createBind } from '@loong-js/react-pure';
import { checkAction } from './check-action';
import { observer } from './observer';

export const bind = createBind({
  view: observer,
  observable(target: any, options?: IObservableOptions) {
    return observable(target, {
      checkAction,
      ...options,
    });
  },
  observe<T = any>(observeFunction: (...args: any[]) => T) {
    const runner = observe(observeFunction);

    return () => {
      unobserve(runner);
    };
  },
});
