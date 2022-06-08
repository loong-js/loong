import 'reflect-metadata';

export { Component } from './annotations/component';
export { Module } from './annotations/module';
export { Injectable } from './annotations/injectable';
export { Prop } from './annotations/prop';
export { Hook } from './annotations/hook';
export { Watch } from './annotations/watch';
export { Autowired } from './annotations/autowired';
export { forwardRef } from './forward-ref';

export type {
  ComponentObservable,
  ComponentObserve,
  IComponentConstructor,
} from './annotations/component';
