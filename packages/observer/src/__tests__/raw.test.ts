import { raw, observable } from '..';

describe('raw', () => {
  test('should return the original object when passed in an observable', () => {
    const value = {};
    const result = observable(value);

    expect(raw(result)).toBe(value);
  });

  test('should also work when passed in is not an observable', () => {
    expect(raw(1)).toBe(1);
  });
});
