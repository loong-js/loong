import { Autowired, Component, Injectable } from '..';
import { IComponentConstructor } from '../annotations/component';

describe('Autowired', () => {
  test('Using Autowired', () => {
    @Injectable()
    class Service {
      count = 0;
    }

    @Component({
      providers: [Service],
    })
    class TestComponent {
      @Autowired()
      service!: Service;
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.();

    // TODO: Cannot get 'get value'. The same below
    expect(component?.getComponent().service).toBe(undefined);
  });
});
