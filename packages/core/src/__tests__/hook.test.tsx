import { Module, Hook, Injectable } from '../';
import { ModuleConstructor } from '../annotations/module';

const HookAny = Hook as any;

describe('Hook', () => {
  test('trigger hook on component', () => {
    @Module()
    class TestModule {
      constructor() {
        // noop
      }

      @HookAny()
      testHook() {
        console.log('testHook');
      }
    }

    const component = (TestModule as ModuleConstructor).create?.() as any;

    component?.hooks.invokeHook('testHook');

    expect(console.log).toHaveBeenCalledWith('testHook');
  });

  test('trigger alias hook', () => {
    @Module()
    class TestModule {
      constructor() {
        // noop
      }

      @HookAny('testHook')
      testHookAlias() {
        console.log('testHookAlias');
      }
    }

    const component = (TestModule as ModuleConstructor).create?.() as any;

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

    @Module({
      providers: [Service],
    })
    class TestModule {}

    const component = (TestModule as ModuleConstructor).create?.() as any;

    component?.hooks.invokeHook('testHook');

    expect(console.log).toHaveBeenCalledWith('testHookAlias');
  });
});
