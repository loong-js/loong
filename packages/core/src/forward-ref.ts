const FORWARD_REF_TYPE = Symbol('FORWARD_REF_TYPE');

export function forwardRef<T extends () => any>(forwardRefFn: T): ClassInstance<ReturnType<T>> {
  let type: ClassInstance<ReturnType<T>>;
  const result = (() => {
    if (type) {
      return type;
    }
    type = forwardRefFn();
    return type;
  }) as any;
  result.forwardRef = FORWARD_REF_TYPE;
  return result;
}

export function isForwardRefFunction(forwardRefFn: any) {
  return typeof forwardRefFn === 'function' && forwardRefFn.forwardRef === FORWARD_REF_TYPE;
}

export function resolveForwardRef(type: any): any {
  return isForwardRefFunction(type) ? type() : type;
}
