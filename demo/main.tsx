import { Action, bind, Component, Hook, Injectable, Prop, Watch } from '@loong-js/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
@Component()
class AppCompnent {
  count = 3;

  @Action()
  add() {
    this.count += 1;
  }
}

const binder = bind(AppCompnent);

@Injectable()
class Service {
  // @Prop()
  count = 0;

  @Prop('count')
  countAlias?: number;

  constructor() {
    console.log('run >>>', this.countAlias);
  }

  @Action()
  increase() {
    this.count += 1;
  }

  @Watch('count')
  watch() {
    console.log('run watch >>>', this.count);
  }

  @Hook()
  mounted() {
    console.log('run >>> mounted');
  }

  @Hook()
  unmount() {
    console.log('run >>> unmount');
  }
}

@Component({
  providers: [Service],
})
class ChildComponent {
  constructor(public service: Service) {}
}

const binder2 = bind(ChildComponent)<any>;

const Child3 = binder(
  ({ $this }) => {
    console.log($this);
    return (
      <div>
        Child3
        {$this.count}
      </div>
    );
  },
  {
    mode: 'found',
  }
);

const Child2 = binder2(({ $this }) => {
  console.log($this.service.count);
  return (
    <div>
      {$this.service.count}
      <button onClick={$this.service.increase}>increase</button>
      <Child3 />
    </div>
  );
});

const Child = binder2(() => {
  return <Child2 />;
});

const App = binder<{ name?: string }>(({ $this }) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      [当前 count]: {count}{' '}
      <button
        onClick={() => {
          setCount(count + 1);
          $this.add();
        }}
      >
        变动
      </button>
      <br />
      {count % 2 === 0 && <Child count={count} />}
    </div>
  );
});

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(<App name="has value">test</App>);

// setTimeout(() => {
//   console.log('run1 >>>', getPlatformProvider(Service));
//   root.unmount();
//   console.log('run2 >>>', getPlatformProvider(Service));
// }, 5000);
