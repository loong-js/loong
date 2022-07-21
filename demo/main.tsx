import {
  bind,
  Component,
  Module,
  Injectable,
  Prop,
  Watch,
  Autowired,
  Hook,
  Action,
  forwardRef,
} from '@loong-js/react';
import { createRoot } from 'react-dom/client';

@Injectable()
class Service {
  // @Priority(PriorityType.CONTINUOUS)
  count = 0;

  // @Priority(PriorityType.SYNCHRONOUS)
  count2 = 0;

  // @Priority(PriorityType.IDLE)
  count3 = 0;

  @Autowired()
  service2 = forwardRef(() => Service2);

  constructor() {
    console.log(this.service2);
  }

  @Watch('count')
  change() {
    console.log('watch', this.count);
  }

  @Action()
  async increase() {
    console.log('this.service2', this.service2);
    this.count++;
    this.count2 += 2;
    console.log('commit');

    await new Promise((resolve) => {
      this.count++;
      this.count2 += 2;
      console.log('commit in promise');
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });

    this.count++;
    this.count2 += 2;
    console.log('commit after promise');
  }

  @Action()
  decrease() {
    this.count--;
  }
}

@Injectable()
class Service2 {
  @Autowired()
  service!: Service;

  // constructor() {
  //   console.log(this.service);
  // }

  decrease() {
    console.log('this.service', this.service);
  }
}

@Injectable()
class Service3 {
  @Autowired()
  service!: Service;

  // constructor() {
  //   console.log(this.service);
  // }

  decrease() {
    console.log('this.service3', this.service);
  }
}

@Module({
  providers: [Service2],
})
class Module2 {}

@Module({
  imports: [Module2],
  providers: [Service3],
})
class Module1 {
  @Prop()
  name = '22';

  constructor(public service3: Service3) {
    console.log('name', this.name);
  }

  @Hook()
  setup() {
    console.log('run Module1');
  }
}

@Component({
  imports: [Module1],
  providers: [Service, Service2],
})
class AppCompnent {
  @Prop()
  name = 'test111';

  constructor(public service: Service, public service2: Service2, public module1: Module1) {
    console.log(this);
  }

  @Hook()
  setup() {
    console.log('run');
  }
}

const binder = bind(AppCompnent);

const App = binder<{ name?: string }>(({ $this }) => {
  console.log('render');
  return (
    <div>
      <p>
        Count = {$this.service.count} - {$this.service.count2}
      </p>
      <button onClick={() => $this.service.increase()}>Increase</button>
      <button onClick={() => $this.service2.decrease()}>Decrease</button>
    </div>
  );
});

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(<App name="has value">test</App>);
