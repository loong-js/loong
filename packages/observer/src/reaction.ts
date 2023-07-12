import { error } from './utils/error';
import { ITERATION_KEY } from './constants/iteration-key';
import { EFFECTS } from './constants/key-cache';
import { TrackOperationType, TriggerOperationType } from './constants/operation-type';
import { hasAllowStateUpdates } from './state-updates';
import { getKeyCache, setKeyCache } from './utils/key-cache';
import { schedule } from './utils/schedule';
import { config } from './config';

export type Key = string | symbol;

export type Effects = Set<Reaction>;

export type Scheduler = () => void;

// Observe function run stack.
const reactionStack: Reaction[] = [];

// Trigger the recorded reactions in the update function.
const pendingReactions: Effects = new Set();

let hasRunningTriggerScheduler = false;

export class Reaction {
  cleaners: Effects[] = [];

  unobserved = false;

  constructor(public observeFunction: (...args: any[]) => any, private scheduler?: Scheduler) {}

  private cleanup() {
    this.cleaners?.forEach((effects) => effects.delete(this));
    this.cleaners = [];
  }

  trigger() {
    if (this.scheduler) {
      this.scheduler();
      return;
    }
    this.observeFunction();
  }

  run(...args: any[]) {
    if (this.unobserved) {
      return this.observeFunction(...args);
    }
    try {
      this.cleanup();
      reactionStack.push(this);
      return this.observeFunction(...args);
    } finally {
      reactionStack.pop();
    }
  }

  stop() {
    if (this.unobserved) {
      return;
    }
    this.unobserved = true;
    this.cleanup();
  }
}

export function getReaction() {
  return reactionStack[reactionStack.length - 1];
}

export function hasRunningReaction() {
  return reactionStack.length > 0;
}

// Collection dependency.
export function track(target: object, type: TrackOperationType, key?: unknown) {
  if (!hasRunningReaction()) {
    return;
  }

  if (type === TrackOperationType.ITERATE) {
    key = ITERATION_KEY;
  }

  let effects = getKeyCache<Effects>(target, key, EFFECTS);
  if (!effects) {
    effects = new Set();
    setKeyCache(target, key, {
      [EFFECTS]: effects,
    });
  }
  const reaction = getReaction();
  effects.add(reaction);
  reaction.cleaners?.push(effects);
}

export function trigger(target: object, type: TriggerOperationType, key?: unknown) {
  // If the type is TriggerOperationType.CLEAR, the target will be a map.
  // After target.clear (), the reactions of all map keys need to be triggered.
  if (type === TriggerOperationType.CLEAR) {
    (target as Map<Key, any>).forEach((_, keyInTarget) => {
      addReactionsForKey(target, keyInTarget);
    });
  } else {
    addReactionsForKey(target, key);
  }

  // If the type is TriggerOperationType.ADD or TriggerOperationType.DELETE or TriggerOperationType.CLEAR,
  // the reactions of some special keys should also be triggered.
  if (
    [TriggerOperationType.ADD, TriggerOperationType.DELETE, TriggerOperationType.CLEAR].includes(
      type
    )
  ) {
    const specialKey = Array.isArray(target) ? 'length' : ITERATION_KEY;
    addReactionsForKey(target, specialKey);
  }

  // If it is a strict mode and is not executed during the action,
  // the update is not allowed.
  if (config.strict === true && !hasAllowStateUpdates()) {
    error('data can only be updated in action.');
  }

  if (hasRunningTriggerScheduler) {
    return;
  }
  hasRunningTriggerScheduler = true;
  // Batch update using scheduler uniformly.
  schedule(() => {
    hasRunningTriggerScheduler = false;
    triggerPendingReactions();
  });
}

function addReactionsForKey(target: object, key: unknown) {
  getKeyCache<Effects>(target, key, EFFECTS)?.forEach((reaction) => pendingReactions.add(reaction));
}

export function triggerPendingReactions() {
  if (pendingReactions.size === 0) {
    return;
  }
  pendingReactions.forEach((reaction) => reaction.trigger());
  pendingReactions.clear();
}
