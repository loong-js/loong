import { Component, Hook, Injectable } from '..';
import { IComponentConstructor } from '../annotations/component';

const HookAny = Hook as any;

describe('Hook', () => {
  test('trigger hook on component', () => {
    @Component()
    class TestComponent {
      constructor() {
        // noop
      }

      @HookAny()
      testHook() {
        console.log('testHook');
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.() as any;

    component?.hooks.invokeHook('testHook');

    expect(console.log).toHaveBeenCalledWith('testHook');
  });

  test('trigger alias hook', () => {
    @Component()
    class TestComponent {
      constructor() {
        // noop
      }

      @HookAny('testHook')
      testHookAlias() {
        console.log('testHookAlias');
      }
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.() as any;

    component?.hooks.invokeHook('testHook');

    expect(console.log).toHaveBeenCalledWith('testHookAlias');
  });

  test('trigger hook on service', () => {
    @Injectable()
    class Service {
      @HookAny()
      testHook() {
        console.log('testHook');
      }
    }

    @Component({
      providers: [Service],
    })
    class TestComponent {}

    const component = (TestComponent as IComponentConstructor).createComponent?.() as any;

    component?.hooks.invokeHook('testHook');

    expect(console.log).toHaveBeenCalledWith('testHookAlias');
  });
});
