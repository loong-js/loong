import { Component, Injectable, IComponentConstructor } from '@loong-js/component';

describe('Injectable', () => {
  test('Using injected services', () => {
    @Injectable()
    class Service {}

    @Component({
      providers: [Service],
    })
    class TestComponent {
      constructor(public service: Service) {}
    }

    const component = (TestComponent as IComponentConstructor).createComponent?.();

    expect(component?.getComponent().service).toBeInstanceOf(Service);
  });
});
