import { Injectable } from '../annotations/injectable';
import { forwardRef, isForwardRefFunction, resolveForwardRef } from '../forward-ref';

@Injectable()
class TestService {}

describe('forwardRef', () => {
  test('the result returned by the execution is the return value of the forwardRef input parameter function', () => {
    const result = forwardRef(() => TestService);
    expect(resolveForwardRef(result)).toBe(TestService);
  });

  test('the result of forwardRef is forwardRefFunction', () => {
    const result = forwardRef(() => TestService);
    expect(isForwardRefFunction(result)).toBeTruthy();
  });

  test('other types return false', () => {
    expect(
      isForwardRefFunction(() => {
        // noop
      })
    ).toBeFalsy();

    expect(isForwardRefFunction({})).toBeFalsy();

    expect(isForwardRefFunction(TestService)).toBeFalsy();
  });
});
