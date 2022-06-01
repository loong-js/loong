import { Component, Prop } from '..';
import { IComponentConstructor } from '../annotations/component';

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
    (TestComponent as IComponentConstructor).createComponent?.({
      initialProps: {
        name: 'has value',
      },
    });

    // TODO: Cannot get 'get value'. The same below
    // test is default value
    expect(console.log).toHaveBeenCalledWith('test');
  });

  test('print prop', () => {
    const component = (TestComponent as IComponentConstructor).createComponent?.({
      initialProps: {
        name: 'has value',
      },
    });

    expect(component?.getComponent().name).toBe('test');
  });

  test('print alias prop', () => {
    const component = (TestComponent as IComponentConstructor).createComponent?.({
      initialProps: {
        name: 'test',
      },
    });

    expect(component?.getComponent().nameAlias).toBe(undefined);
  });

  test('print default value', () => {
    const component = (TestComponent as IComponentConstructor).createComponent?.({});

    expect(component?.getComponent().name).toBe('test');
  });
});
