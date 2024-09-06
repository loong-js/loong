import 'reflect-metadata';

export { Autowired } from './annotations/autowired';
export { Hook } from './annotations/hook';
export { Injectable } from './annotations/injectable';
export { Module } from './annotations/module';
export type {
  ICreateModuleOptions,
  IModuleConstructor,
  IModuleOptions,
  IProviderConstructor,
  ModuleObservable,
  ModuleObserve,
} from './annotations/module';
export { targetToWatchNameAndKeys, Watch } from './annotations/watch';
export { forwardRef } from './forward-ref';
export { ModuleRegistry } from './module-registry';
export { providerToModuleRegistryMap } from './utils/get-provider-to-module-registry-map';
export { getPlatformProvider, waitForPlatformProvider, waitForVariable } from './platform-provider';
