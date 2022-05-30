import {
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  FunctionComponent,
  PropsWithChildren,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  useEffect,
  useMemo,
} from 'react';
import { observe, unobserve } from '@loong-js/observer';
import { useForceUpdate } from './hooks/use-force-update';

export interface IObserverOptions {
  forwardRef?: boolean;
}

export function observer<P = Record<string, never>>(
  Component: FunctionComponent<P>,
  options?: IObserverOptions
): FunctionComponent<P>;
export function observer<T, P = Record<string, never>>(
  Component: ForwardRefRenderFunction<T, P>,
  options?: IObserverOptions
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
export function observer<T, P = Record<string, never>>(
  Component: FunctionComponent<P> | ForwardRefRenderFunction<T, P>,
  options?: IObserverOptions
) {
  const WrappedComponent = (props: PropsWithChildren<P>, contextOrRef?: Ref<T> | any) => {
    const forceUpdate = useForceUpdate();
    const render = useMemo(
      () =>
        observe(Component, {
          lazy: true,
          scheduler: forceUpdate,
        }),
      []
    );

    useEffect(() => {
      return () => {
        unobserve(render);
      };
    }, []);

    return render(props, contextOrRef);
  };

  WrappedComponent.displayName = Component.displayName;

  if ((Component as FunctionComponent<P>).contextTypes) {
    WrappedComponent.contextTypes = (Component as FunctionComponent<P>).contextTypes;
  }

  if (options?.forwardRef) {
    return forwardRef(WrappedComponent);
  }

  return WrappedComponent;
}
