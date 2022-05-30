import { targetToHookNameAndKeys } from './annotations/hook';
import { EventEmitter } from './utils/event-emitter';

export class Hooks {
  private hooks = new Map<string, EventEmitter>();

  constructor(private providers: any[]) {
    this.providers.forEach((provider) => {
      targetToHookNameAndKeys.get(provider.constructor)?.forEach((hookNameAndKey) => {
        const [hookName, key] = hookNameAndKey;
        this.addHook(hookName, provider[key].bind(provider));
      });
    });
  }

  private addHook(hookName: string, hook: (...args: any[]) => any) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new EventEmitter());
    }
    this.hooks.get(hookName)?.add(hook);
  }

  invokeHook<T extends keyof LoongCore.IHookParameters>(
    hookName: T,
    ...args: Parameters<LoongCore.IHookParameters[T]>
  ): ReturnType<LoongCore.IHookParameters[T]>[] {
    return this.hooks.get(hookName)?.emit(...args) as ReturnType<LoongCore.IHookParameters[T]>[];
  }
}
