export { Injectable, forwardRef, Autowired, Module } from '@loong-js/core';
export { Component } from './annotations/component';
export { Prop } from './annotations/prop';
export { Hook } from './annotations/hook';
export { Watch } from './annotations/watch';

export type {
  ComponentObservable,
  ComponentObserve,
  IComponentConstructor,
} from './annotations/component';
