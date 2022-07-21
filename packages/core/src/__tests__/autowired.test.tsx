import { Autowired, Module, Injectable } from '..';
import { ModuleConstructor } from '../annotations/module';

describe('Autowired', () => {
  test('Using Autowired', () => {
    @Injectable()
    class Service {
      count = 0;
    }

    @Module({
      providers: [Service],
    })
    class TestModule {
      @Autowired()
      service!: Service;
    }

    const component = (TestModule as ModuleConstructor).create?.();

    // TODO: Cannot get 'get value'. The same below
    expect(component?.getModule().service).toBe(undefined);
  });
});
