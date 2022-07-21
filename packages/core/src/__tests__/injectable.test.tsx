import { Injectable } from '@loong-js/core';
import { Module, ModuleConstructor } from '../annotations/module';

describe('Injectable', () => {
  test('Using injected services', () => {
    @Injectable()
    class Service {}

    @Module({
      providers: [Service],
    })
    class TestModule {
      constructor(public service: Service) {}
    }

    const component = (TestModule as ModuleConstructor).create?.();

    expect(component?.getModule().service).toBeInstanceOf(Service);
  });
});
