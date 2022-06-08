import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { createBind } from '@loong-js/react-pure';

export const bind = createBind({
  view: observer,
  observe: (observeFunction) => {
    const disposer = autorun(observeFunction);

    return disposer;
  },
});
