import type { ModuleObservable, ModuleObserve, ComponentConstructor } from '.';
import {
  createElement,
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  FunctionComponent,
  PropsWithChildren,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { BindContext } from './context';

export type PropsWith$This<T extends ComponentConstructor, P = Record<string, never>> = {
  $this: InstanceType<T>;
} & PropsWithChildren<P>;

enum BinderMode {
  ALONE = 'alone',
  DEPENDENT = 'dependent',
}

export interface IBinderOptions {
  forwardRef?: boolean;
  mode?: Lowercase<keyof typeof BinderMode>;
}

export type PropsWithout$This<P> = Omit<P, '$this'> & PropsWithChildren<P>;

export interface IViewOptions {
  forwardRef?: boolean;
}

export type BoundProps<Binder> = Binder extends (
  ReactComponent:
    | FunctionComponent<PropsWith$This<infer T, Record<string, never>>>
    | ForwardRefRenderFunction<
        Record<string, never>,
        PropsWith$This<infer T, Record<string, never>>
      >,
  options?: IBinderOptions
) => any
  ? {
      $this: InstanceType<T>;
    }
  : never;

interface ICreateBindOptions {
  view?: <T, P = Record<string, never>>(
    Component: FunctionComponent<P> | ForwardRefRenderFunction<T, P>,
    options?: IViewOptions
  ) => FunctionComponent<P> | ForwardRefRenderFunction<T, P>;
  observe?: ModuleObserve;
  observable?: ModuleObservable;
}

export function createBind(options?: ICreateBindOptions) {
  return function bind<T extends ComponentConstructor>(Component: T) {
    function binder<P = Record<string, never>>(
      ReactComponent: FunctionComponent<PropsWith$This<T, P>>,
      binderOptions?: IBinderOptions
    ): FunctionComponent<PropsWithout$This<P>>;
    function binder<P = Record<string, never>, BinderRef = Record<string, never>>(
      ReactComponent: ForwardRefRenderFunction<BinderRef, PropsWith$This<T, P>>,
      binderOptions?: IBinderOptions
    ): ForwardRefExoticComponent<
      PropsWithChildren<PropsWithoutRef<PropsWithout$This<P>>> & RefAttributes<BinderRef>
    >;
    function binder<P = Record<string, never>, BinderRef = Record<string, never>>(
      ReactComponent:
        | FunctionComponent<PropsWith$This<T, P>>
        | ForwardRefRenderFunction<BinderRef, PropsWith$This<T, P>>,
      binderOptions?: IBinderOptions
    ) {
      if (options?.view) {
        ReactComponent = options.view(ReactComponent, {
          forwardRef: binderOptions?.forwardRef,
        });
      }

      const WrappedComponent = (
        props: PropsWithChildren<PropsWithout$This<P>>,
        contextOrRef?: Ref<BinderRef> | any
      ) => {
        const context = useContext(BindContext);
        const restProps: PropsWithChildren<PropsWithout$This<P>> & RefAttributes<BinderRef> = {
          ...props,
        };

        if (binderOptions?.forwardRef) {
          restProps.ref = contextOrRef;
        }

        if (
          binderOptions?.mode !== BinderMode.ALONE &&
          context.$this &&
          context.$this.constructor === Component
        ) {
          return createElement(ReactComponent, {
            $this: context.$this,
            ...restProps,
          } as PropsWithChildren<PropsWith$This<T, P>>);
        }

        const component = useMemo(
          () =>
            (Component as Required<ComponentConstructor>).create({
              initialProps: props,
              observe: options?.observe,
              observable: options?.observable,
              dependencies: context.dependencies,
            }),
          []
        );
        const dependencies = useMemo(() => component.providerRegistry.getDependencies(), []);
        const $this = useMemo(() => component.getComponent(), []);

        component.props.setProps(props);
        component.hooks.invokeHook('setup');

        useEffect(() => {
          component.hooks.invokeHook('mounted');

          return () => {
            component.hooks.invokeHook('unmount');
            component.destroy();
          };
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return createElement(
          BindContext.Provider,
          {
            value: {
              dependencies,
              $this,
            },
          },
          createElement(ReactComponent, {
            $this,
            ...restProps,
          } as PropsWithChildren<PropsWith$This<T, P>>)
        );
      };

      WrappedComponent.displayName = ReactComponent.displayName;

      if ((ReactComponent as FunctionComponent<PropsWith$This<T, P>>).contextTypes) {
        WrappedComponent.contextTypes = (
          ReactComponent as FunctionComponent<PropsWith$This<T, P>>
        ).contextTypes;
      }

      if (binderOptions?.forwardRef) {
        return forwardRef(WrappedComponent);
      }

      return WrappedComponent;
    }

    return binder;
  };
}

export const bind = createBind();
