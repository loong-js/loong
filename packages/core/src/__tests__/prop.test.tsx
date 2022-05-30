import { Component, Prop } from '..';
import { IComponentConstructor } from '../annotations/component';

@Component()
class TestComponent {
  @Prop()
  name!: string;

  @Prop('name')
  nameAlias!: string;

  constructor() {
    console.log(this.name);
  }
}

describe('Prop', () => {
  test('get prop correctly in constructor', () => {
    (TestComponent as IComponentConstructor).createComponent?.({
      initialProps: {
        name: 'test',
      },
    });

    // TODO: Cannot get 'get value'. The same below
    expect(console.log).toHaveBeenCalledWith(undefined);
  });

  test('print prop', () => {
    const component = (TestComponent as IComponentConstructor).createComponent?.({
      initialProps: {
        name: 'test',
      },
    });

    expect(component?.getComponent().name).toBe(undefined);
  });

  test('print alias prop', () => {
    const component = (TestComponent as IComponentConstructor).createComponent?.({
      initialProps: {
        name: 'test',
      },
    });

    expect(component?.getComponent().nameAlias).toBe(undefined);
  });
});
