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
export { ModuleRegistry, providerToModuleRegistryMap } from './module-registry';
export { getPlatformProvider, waitForPlatformProvider } from './platform-provider';
