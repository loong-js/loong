import { isObservable, observable, observe, setConfig } from '..';

describe('observable', () => {
  test('should throw an error when no argument is provided or an unqualified value is provided', () => {
    (observable as any)();

    expect(console.warn).toHaveBeenCalledWith(
      '[@loong-js/observer]: undefined cannot be made observable'
    );

    (observable as any)(1);

    expect(console.warn).toHaveBeenCalledWith('[@loong-js/observer]: 1 cannot be made observable');

    (observable as any)(null);

    expect(console.warn).toHaveBeenCalledWith(
      '[@loong-js/observer]: null cannot be made observable'
    );

    (observable as any)('string type');

    expect(console.warn).toHaveBeenCalledWith(
      '[@loong-js/observer]: string type cannot be made observable'
    );
  });

  test('should return an observable wrapped object', () => {
    const value = {};
    const result = observable(value);

    expect(result).not.toBe(value);
    expect(isObservable(result)).toBe(true);
  });

  test('should return the value directly when the value is already an observable object', () => {
    const result = observable({});
    const result2 = observable(result);

    expect(result).toBe(result2);
  });

  test('should return the same observable when passed the same value', () => {
    const value = {};
    const result = observable(value);
    const result2 = observable(value);

    expect(result).toBe(result2);
  });

  test('should not observe when nested objects are not writable', () => {
    const value: any = {};
    let count = 0;

    Reflect.defineProperty(value, 'nested', {
      value: {
        count: 1,
      },
      writable: false,
      configurable: false,
    });

    const result = observable(value);

    expect(isObservable(result.nested)).toBe(false);

    observe(() => {
      count = result.nested.count;
    });

    expect(count).toBe(1);

    result.nested.count = 2;

    expect(count).toBe(1);
  });

  test('should also be an observable when the value has nested objects', () => {
    const value = {
      nested: {
        count: 1,
      },
    };
    const result = observable(value);

    observe(() => {
      console.log(result.nested.count);
    });

    expect(isObservable(result.nested)).toBe(true);
  });

  test('should only use generator functions to update data when configured strict = true', () => {
    setConfig({
      strict: true,
      checkAction(result) {
        return typeof result === 'function';
      },
    });
    const result = observable({
      count: 1,
      setCount() {
        this.count = 2;
      },
    });

    observe(() => {
      console.log(result.count);
    });

    expect(console.log).toHaveBeenCalledWith(1);

    result.setCount();

    expect(console.log).toHaveBeenCalledWith(2);

    expect(() => (result.count = 4)).toThrow(
      '[@loong-js/observer]: data can only be updated in action.'
    );
  });

  test('should automatically bind this in generator functions when strict = true and autoBind = true', () => {
    setConfig({
      strict: true,
      autoBind: true,
      checkAction(result) {
        return typeof result === 'function';
      },
    });
    const result = observable({
      count: 1,
      setCount() {
        this.count = 2;
      },
    });
    const { setCount } = result;

    observe(() => {
      console.log(result.count);
    });

    expect(console.log).toHaveBeenCalledWith(1);

    setCount();

    expect(console.log).toHaveBeenCalledWith(2);
  });
});
