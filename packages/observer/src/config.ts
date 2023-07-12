import { Key } from './reaction';

export type CheckActionType = (result: Function, target: object, key: Key) => boolean;

interface IConfig {
  checkAction?: CheckActionType;
  autoBind?: boolean;
  strict?: boolean;
}

export let config: IConfig = {};

export function setConfig(newConfig: IConfig) {
  config = {
    ...config,
    ...newConfig,
  };
}
