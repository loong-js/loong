import { Injectable } from '@loong-js/core';
import { Component } from '..';
import { ComponentConstructor } from '../annotations/component';
import { ComponentRegistry } from '../component-registry';

abstract class LoggerService {
  abstract log(): void;
}

@Injectable()
class LoggerServiceImpl implements LoggerService {
  log() {
    console.log('LoggerServiceImpl');
  }
}

@Component({
  providers: [
    {
      provide: LoggerService,
      useClass: LoggerServiceImpl,
    },
  ],
})
class TestComponent {
  constructor(public loggerService: LoggerService) {
    // noop
  }
}

describe('Injectable', () => {
  test('Using injected services', () => {
    const component = (TestComponent as ComponentConstructor).create?.();

    expect(component).toBeInstanceOf(ComponentRegistry);
  });

  test('Using actual injection is a different provider', () => {
    const component = (TestComponent as ComponentConstructor).create?.();

    component?.getComponent().loggerService.log();

    expect(console.log).toHaveBeenCalledWith('LoggerServiceImpl');
  });
});
