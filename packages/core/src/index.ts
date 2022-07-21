import 'reflect-metadata';

export { Module } from './annotations/module';
export { Injectable } from './annotations/injectable';
export { Autowired } from './annotations/autowired';
export { Watch } from './annotations/watch';
export { Hook } from './annotations/hook';
export { forwardRef } from './forward-ref';
export { ModuleRegistry, providerToModuleRegistryMap } from './module-registry';
export type {
  IModuleOptions,
  ICreateModuleOptions,
  IProviderConstructor,
  IModuleConstructor,
  ModuleObservable,
  ModuleObserve,
} from './annotations/module';
