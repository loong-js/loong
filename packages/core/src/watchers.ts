import { ComponentObserve } from './annotations/component';
import { IWatchParameters, targetToWatchNameAndKeys } from './annotations/watch';

export class Watchers {
  private watchers: Watcher[] = [];

  private watcher: Watcher | null = null;

  constructor(private providers: any[], private observe?: ComponentObserve) {}

  createWatchers() {
    const observe = this.observe;
    if (observe) {
      this.providers.forEach((provider) => {
        targetToWatchNameAndKeys.get(provider.constructor)?.forEach(([key, parameters]) => {
          this.watchers.push(new Watcher(this, provider, provider[key], parameters, observe));
        });
      });
    }
  }

  setWatcher(watcher: Watcher) {
    this.watcher = watcher;
  }

  getWatcher() {
    return this.watcher;
  }

  clearWatcher() {
    this.watcher = null;
  }

  watchAfterCheckObservedProps() {
    this.watchers.forEach((watcher) => watcher.watchAfterCheckObservedProps());
  }

  destroy() {
    this.watchers.forEach((watcher) => watcher.destroy());
  }
}

class Watcher {
  private unobserve: () => void;

  private needObservedProps = false;

  private firstDependency = true;

  private dependencyList: any[] = [];

  constructor(
    private watchers: Watchers,
    private provider: any,
    private effect: () => void,
    private parameters: IWatchParameters,
    private observe: ComponentObserve
  ) {
    this.unobserve = observe(this.watch);
  }

  private checkDependencyList(currentDependencyList: any[]) {
    if (
      this.firstDependency ||
      currentDependencyList.some((dependency, index) => this.dependencyList[index] !== dependency)
    ) {
      this.firstDependency = false;
      this.dependencyList = currentDependencyList;
      return true;
    }
    return false;
  }

  private wrapper<T extends () => any>(predicate: T): ReturnType<T> {
    this.watchers.setWatcher(this);
    const result = predicate();
    this.watchers.clearWatcher();
    return result;
  }

  private watch = () => {
    const effect = this.effect.bind(this.provider);
    const { predicate, names } = this.parameters;
    if (predicate) {
      const result = this.wrapper(() => predicate?.(this.provider));
      if (
        (Array.isArray(result) && this.checkDependencyList(result)) ||
        (typeof result === 'boolean' && result)
      ) {
        effect();
      }
    } else if (names) {
      const currentDependencyList = this.wrapper(() => names.map((name) => this.provider[name]));
      if (this.checkDependencyList(currentDependencyList)) {
        effect();
      }
    }
  };

  // When there are changes to monitor props, you need to manually trigger the observation during setProps.
  watchAfterCheckObservedProps() {
    if (this.needObservedProps) {
      this.watch();
    }
  }

  checkNeedObservedProps() {
    this.needObservedProps = true;
  }

  destroy() {
    this.unobserve();
  }
}
