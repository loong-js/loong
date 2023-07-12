import { endBatch, startBatch } from './batch-updates';
import { config } from './config';
import { ACTIONS } from './constants/key-cache';
import { rawToProxyMap } from './observable';
import { disableAllowStateUpdates, enableAllowStateUpdates } from './state-updates';
import { getKeyCache, setKeyCache } from './utils/key-cache';

export function createAction(target: object, key: unknown, action: GeneratorFunction) {
  const result = getKeyCache(target, key, ACTIONS);

  if (result) {
    return result;
  }

  let scope: any;

  if (config.autoBind !== false) {
    const proxy = rawToProxyMap.get(target);
    scope = proxy;
  }
  function internalAction(...args: any[]) {
    return executeAction(action, scope, config.strict !== false, ...args);
  }

  setKeyCache(target, key, {
    [ACTIONS]: internalAction,
  });

  return internalAction;
}

function executeAction(action: Function, scope: any, strict: boolean, ...args: any[]) {
  try {
    enableAllowStateUpdates(strict);
    startBatch();
    return action.apply(scope, args);
  } finally {
    endBatch();
    disableAllowStateUpdates();
  }
}
