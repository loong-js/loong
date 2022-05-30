import { observable, observe, unobserve } from '../../observer';
import { Component, Watch, Prop, Injectable } from '../';
import { IComponentConstructor } from '../annotations/component';
import { ComponentRegistry } from '../component-registry';

describe('Watch', () => {
  test('pass in the property name string of the current class (component or service)', () => {
    @Component()
    class TestComponent {
      count = 0;

      @Watch('count')
      change() {
        console.log(this.count);
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.({
      observable: (value) =>
        observable(value, {
          strict: false,
        }),
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ComponentRegistry;

    expect(console.log).toHaveBeenCalledWith(0);

    component.getComponent().count++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1);
    });
  });

  test('pass in an arrow function that returns a dependent array', () => {
    @Component()
    class TestComponent {
      count1 = 0;

      count2 = 0;

      @Watch('count1', 'count2')
      change() {
        console.log(this.count1, this.count2);
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.({
      observable: (value) =>
        observable(value, {
          strict: false,
        }),
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ComponentRegistry;

    expect(console.log).toHaveBeenCalledWith(0, 0);

    component.getComponent().count1++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1, 0);
    });

    component.getComponent().count2++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1, 1);
    });
  });

  test('watch the change of prop', () => {
    @Component()
    class TestComponent {
      count = 0;

      @Prop()
      name!: string;

      @Watch('name')
      change() {
        this.count++;
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.({
      observable: (value) =>
        observable(value, {
          strict: false,
        }),
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ComponentRegistry;

    expect(component.getComponent().count).toBe(1);

    component.getComponent().count++;

    setTimeout(() => {
      expect(component.getComponent().count).toBe(2);
    });
  });

  test('pass in an arrow function that returns a Boolean value', () => {
    @Component()
    class TestComponent {
      count = 0;

      @Watch(({ count }) => count >= 1)
      change() {
        console.log(this.count);
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.({
      observable: (value) =>
        observable(value, {
          strict: false,
        }),
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ComponentRegistry;

    expect(console.log).toHaveBeenCalledWith(0);

    component.getComponent().count++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1);
    });
  });

  test('watch the value that changes in the service', () => {
    @Injectable()
    class Service {
      count = 0;
    }
    @Component({
      providers: [Service],
    })
    class TestComponent {
      constructor(public service: Service) {}

      @Watch(({ service }) => [service.count])
      change() {
        console.log(this.service.count);
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.({
      observable: (value) =>
        observable(value, {
          strict: false,
        }),
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ComponentRegistry;

    expect(console.log).toHaveBeenCalledWith(0);

    component.getComponent().service.count++;

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(1);
    });
  });
});
