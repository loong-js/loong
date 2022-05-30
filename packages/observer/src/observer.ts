import { Reaction, Scheduler } from './reaction';

interface IObserveOptions {
  lazy?: boolean;
  scheduler?: Scheduler;
}

export interface IObserveRunner<T = any> {
  (...args: any[]): T;
  reaction: Reaction;
}

export function observe<T = any>(
  observeFunction: (...args: any[]) => T,
  options?: IObserveOptions
): IObserveRunner<T> {
  if ((observeFunction as IObserveRunner).reaction) {
    observeFunction = (observeFunction as IObserveRunner).reaction.observeFunction;
  }

  const reaction = new Reaction(observeFunction, options?.scheduler);

  if (!options?.lazy) {
    reaction.run();
  }

  const runner = reaction.run.bind(reaction) as IObserveRunner;
  runner.reaction = reaction;

  return runner;
}

export function unobserve(runner: IObserveRunner) {
  runner.reaction.stop();
}
