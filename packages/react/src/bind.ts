import { observable, observe, setConfig, unobserve } from '@loong-js/observer';
import { createBind } from '@loong-js/react-pure';
import { checkAction } from './check-action';
import { observer } from './observer';

setConfig({
  checkAction,
});

export const bind = createBind({
  view: observer,
  observable(target: any) {
    return observable(target);
  },
  observe<T = any>(observeFunction: (...args: any[]) => T) {
    const runner = observe(observeFunction);

    return () => {
      unobserve(runner);
    };
  },
});
