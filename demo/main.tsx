import { bind, Component, Injectable, Prop, Watch, Autowired, Hook, Action } from '@loong-js/react';
import { createRoot } from 'react-dom/client';

// abstract class Logger {
//   abstract log(): void;
// }

// @Injectable()
// class LoggerImpl implements Logger {
//   log() {
//     console.log('LoggerImpl');
//   }
// }

// @Injectable()
// class Service1 {
//   @Prop()
//   name!: string;

//   count = 0;

//   constructor() {
//     console.log(this.name);
//   }

//   *changeCount() {
//     this.count = 3;
//   }

//   @Hook()
//   mounted() {
//     console.log('mounted');
//   }

//   @Watch(({ count }) => [count])
//   watch() {
//     console.log('count change');
//   }
// }

// @Injectable()
// class Service2 {
//   @Autowired()
//   service1!: Service1;

//   constructor(private logger: LoggerImpl) {
//     console.log(this.logger);
//   }
// }

// @Component({
//   providers: [
//     Service1,
//     {
//       provide: Logger,
//       useClass: LoggerImpl,
//     },
//   ],
// })
// class TestComponent {
//   constructor(public service2: Service2, public logger: Logger) {
//     this.logger.log();
//   }
// }

// export const binder = bind(TestComponent);

abstract class Service2 {
  abstract service: Service;

  abstract decrease(): void;
}

@Injectable()
class Service {
  count = 0;

  count2 = 0;

  @Autowired()
  service2!: Service2;

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
class Service2Impl implements Service2 {
  @Autowired()
  service!: Service;

  decrease() {
    console.log('this.service', this.service);
  }
}

@Component({
  providers: [
    Service,
    {
      provide: Service2,
      useClass: Service2Impl,
    },
  ],
})
class AppCompnent {
  @Prop()
  name!: string;

  constructor(public service: Service, public service2: Service2) {
    console.log(this);
  }

  @Hook()
  setup() {
    console.log('run');
  }
}

@Component({
  providers: [],
})
class ChildCompnent {
  @Prop()
  name!: string;

  constructor(public service: Service, public service2: Service2) {
    console.log(this);
  }

  @Hook()
  setup() {
    console.log('run');
  }
}

const binder = bind(AppCompnent);

const binder2 = bind(ChildCompnent);

const Child = binder2<{ name: string }>(({ $this }) => <div>Child {$this.service.count}</div>);

const App = binder<{ name: string }>(({ $this }) => {
  console.log('render');
  return (
    <div>
      <p>
        Count = {$this.service.count} - {$this.service.count2}
      </p>
      <Child name="test">test</Child>
      <button onClick={() => $this.service.increase()}>Increase</button>
      <button onClick={() => $this.service2.decrease()}>Decrease</button>
    </div>
  );
});

/**
 * connect(Component) => connector
 *
 * connect(Component)(React) => React
 *
 * not create, have connect
 *
 * A - B(BComponent) create - B(BComponent) connect
 *   - C(CComponent) - B(BComponent) create
 */

createRoot(document.getElementById('root') as HTMLElement).render(<App name="app">test</App>);

// import { observable, observe } from '@/observer';

// const value = observable({
//   count: 0,
//   setCount2() {
//     this.count = 2;
//   },
//   *setCount() {
//     this.count = 1;
//     this.setCount2();
//     this.count = 3;
//   },
// });

// observe(() => {
//   console.log('run >>>', value.count);
// });

// /**
//  * 1. 只能在对象方法中修改值，绝不允许直接修改值
//  * 2. 最顶层方法执行完成，才可批量更新数据 ✅
//  *
//  * 更新函数不能每个都变成 action
//  *
//  * 只能通过 action 进行更新
//  */

// const { setCount } = value;
// // ✅
// setCount();

// // ❎
// // value.count = 4;
