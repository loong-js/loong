import { Watchers } from './watchers';

export class Props {
  constructor(private props: any, private getWatchers: () => Watchers) {}

  setProps(props: any) {
    this.props = props;
    this.getWatchers().watchAfterCheckObservedProps();
  }

  getProps() {
    return this.props || {};
  }

  getProp(name: string | symbol) {
    return this.getProps()[name];
  }
}
