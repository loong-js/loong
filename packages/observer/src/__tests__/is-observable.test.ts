import { isObservable, observable } from '..';

describe('isObservable', () => {
  test('should return true when the parameter is an observable', () => {
    const result = observable({});

    expect(isObservable(result)).toBe(true);
  });

  test('should return false when the parameter is a proxy object', () => {
    const result = new Proxy({}, {});

    expect(isObservable(result)).toBe(false);
  });

  test('should return false when the parameter is a primitive type', () => {
    expect(isObservable(1)).toBe(false);
  });
});
