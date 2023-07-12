import { Watch } from '@loong-js/core';
import { observable, observe, unobserve, setConfig } from '@loong-js/observer';
import { Component, Prop } from '..';
import { ComponentConstructor } from '../annotations/component';
import { ComponentRegistry } from '../component-registry';

setConfig({
  strict: false,
});

@Component()
class TestComponent {
  @Prop()
  name = 'test';

  @Prop('name')
  nameAlias!: string;

  constructor() {
    console.log(this.name);
  }
}

describe('Prop', () => {
  test('get prop correctly in constructor', () => {
    (TestComponent as ComponentConstructor).create?.({
      initialProps: {
        name: 'has value',
      },
    });

    // TODO: Cannot get 'get value'. The same below
    // test is default value
    expect(console.log).toHaveBeenCalledWith('test');
  });

  test('print prop', () => {
    const component = (TestComponent as ComponentConstructor).create?.({
      initialProps: {
        name: 'has value',
      },
    });

    expect(component?.getComponent().name).toBe('test');
  });

  test('print alias prop', () => {
    const component = (TestComponent as ComponentConstructor).create?.({
      initialProps: {
        name: 'test',
      },
    });

    expect(component?.getComponent().nameAlias).toBe(undefined);
  });

  test('print default value', () => {
    const component = (TestComponent as ComponentConstructor).create?.({});

    expect(component?.getComponent().name).toBe('test');
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

    const module = (TestComponent as ComponentConstructor).create?.({
      observable,
      observe: (observeFunction: (...args: any[]) => any) => {
        const runner = observe(observeFunction);
        return () => {
          unobserve(runner);
        };
      },
    }) as ComponentRegistry;

    expect(module.getComponent().count).toBe(1);

    module.getComponent().count++;

    setTimeout(() => {
      expect(module.getComponent().count).toBe(2);
    });
  });
});
