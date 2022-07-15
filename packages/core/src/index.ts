import 'reflect-metadata';

export { Module } from './annotations/module';
export { Injectable } from './annotations/injectable';
export { Autowired } from './annotations/autowired';
export { forwardRef } from './forward-ref';
export { ModuleRegistry, providerToModuleRegistryMap } from './module-registry';
export type {
  IModuleOptions,
  ICreateModuleOptions,
  IProviderConstructor,
} from './annotations/module';
