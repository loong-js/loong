import { bind, Component, Injectable, Prop, Watch } from '@loong-js/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
@Component()
class AppCompnent {}

const binder = bind(AppCompnent);

@Injectable()
class Service {
  @Prop()
  count?: number;

  @Prop('count')
  countAlias?: number;

  @Prop()
  increase?: () => void;

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
