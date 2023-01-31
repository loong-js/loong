import { bind, Component, Injectable, Prop, Watch } from '@loong-js/react';
// import { observable } from 'mobx';
import { makeObservable, observable } from 'mobx';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
@Component()
class AppCompnent {}

const binder = bind(AppCompnent);

@Injectable()
class Service {
  @Prop()
  // @observable
  count?: number;

  @Prop('count')
  countAlias?: number;

  @Prop()
  increase?: () => void;

  constructor() {
    console.log('run >>>', this.count);
    makeObservable(this, {
      count: observable,
    });
  }

  @Watch('count')
  watchCount() {
    console.log(this.count);
  }
}

@Component({
  providers: [Service],
})
class ChildComponent {
  constructor(public service: Service) {}
}

const binder2 = bind(ChildComponent)<any>;

const Child2 = binder2(({ $this }) => {
  console.log($this.service.count);
  return (
    <div>
      {$this.service.count}
      <button onClick={$this.service.increase}>increase</button>
    </div>
  );
});

const Child = binder2(() => {
  return <Child2 />;
});

const App = binder<{ name?: string }>(({ $this }) => {
  const [count, setCount] = useState(1);
  return (
    <div>
      <Child count={count} increase={() => setCount(count + 1)} />
      <Child count={count + 1} increase={() => setCount(count - 1)} />
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
