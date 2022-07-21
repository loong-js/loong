export class Props<T = any> {
  constructor(private props: any, private afterChange?: (props: T) => void) {}

  setProps(props: T) {
    this.props = props;
    this.afterChange?.(props);
  }

  getProps() {
    return this.props || {};
  }

  getProp(name: string | symbol) {
    return this.getProps()[name];
  }
}
