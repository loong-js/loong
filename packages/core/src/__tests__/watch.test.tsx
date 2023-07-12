import { Injectable } from '@loong-js/core';
import { observable, observe, unobserve, setConfig } from '@loong-js/observer';
import { Module, ModuleConstructor } from '../annotations/module';
import { Watch } from '../annotations/watch';
import { ModuleRegistry } from '../module-registry';

setConfig({
  strict: false,
});

describe('Watch', () => {
  test('pass in the property name string of the current class (module or service)', () => {
    @Module()
    class TestModule {
      count = 0;

      @Watch('count')
      change() {
        console.log(this.count);
      }
    }

    const module = (TestModule as ModuleConstructor).create?.({
      observable,
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ModuleRegistry;

    expect(console.log).toHaveBeenCalledWith(0);

    module.getModule().count++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1);
    });
  });

  test('pass in an arrow function that returns a dependent array', () => {
    @Module()
    class TestModule {
      count1 = 0;

      count2 = 0;

      @Watch('count1', 'count2')
      change() {
        console.log(this.count1, this.count2);
      }
    }

    const module = (TestModule as ModuleConstructor).create?.({
      observable,
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ModuleRegistry;

    expect(console.log).toHaveBeenCalledWith(0, 0);

    module.getModule().count1++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1, 0);
    });

    module.getModule().count2++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1, 1);
    });
  });

  test('pass in an arrow function that returns a Boolean value', () => {
    @Module()
    class TestModule {
      count = 0;

      @Watch(({ count }) => count >= 1)
      change() {
        console.log(this.count);
      }
    }

    const module = (TestModule as ModuleConstructor).create?.({
      observable,
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ModuleRegistry;

    expect(console.log).toHaveBeenCalledWith(0);

    module.getModule().count++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1);
    });
  });

  test('watch the value that changes in the service', () => {
    @Injectable()
    class Service {
      count = 0;
    }

    @Module({
      providers: [Service],
    })
    class TestModule {
      constructor(public service: Service) {}

      @Watch(({ service }) => [service.count])
      change() {
        console.log(this.service.count);
      }
    }

    const module = (TestModule as ModuleConstructor).create?.({
      observable,
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ModuleRegistry;

    expect(console.log).toHaveBeenCalledWith(0);

    module.getModule().service.count++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1);
    });
  });
});
