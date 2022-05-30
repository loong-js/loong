// Each time Component is initialized, props are set,
// and this props can also be used when the provider is initialized.
let initialProps: any = null;

export function setInitialProps(props?: any) {
  initialProps = props || null;
}

export function resetInitialProps() {
  initialProps = null;
}

export function getInitialProps() {
  return initialProps;
}
