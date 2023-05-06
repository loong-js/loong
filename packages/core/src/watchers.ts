import { ModuleObserve } from './';
import { IWatchParameters, targetToWatchNameAndKeys } from './annotations/watch';
import { ProviderRegistry } from './provider-registry';

export class Watchers {
  private watchers: Watcher[] = [];

  private watcher: Watcher | null = null;

  constructor(private providerRegistry: ProviderRegistry, private observe?: ModuleObserve) {}

  createWatchers() {
    const observe = this.observe;
    if (observe) {
      this.providerRegistry.getProviders().forEach((provider) => {
        targetToWatchNameAndKeys.get(provider.constructor)?.forEach(([key, parameters]) => {
          this.watchers.push(
            new Watcher(
              this,
              () => this.providerRegistry.getProvider(provider.constructor),
              () =>
                this.providerRegistry
                  .getProvider(provider.constructor)
                  ?.[key]?.call(this.providerRegistry.getProvider(provider.constructor)),
              parameters,
              observe
            )
          );
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
    private getProvider: () => any,
    private effect: () => void,
    private parameters: IWatchParameters,
    private observe: ModuleObserve
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
    const { predicate, names } = this.parameters;
    const provider = this.getProvider();
    if (predicate) {
      const result = this.wrapper(() => predicate?.(provider));
      if (
        (Array.isArray(result) && this.checkDependencyList(result)) ||
        (typeof result === 'boolean' && result)
      ) {
        this.effect();
      }
    } else if (names) {
      const currentDependencyList = this.wrapper(() => names.map((name) => provider[name]));
      if (this.checkDependencyList(currentDependencyList)) {
        this.effect();
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
