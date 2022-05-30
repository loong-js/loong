import { actionMap } from './annotations/action';

export function checkAction(result: Function) {
  return actionMap.has(result);
}
