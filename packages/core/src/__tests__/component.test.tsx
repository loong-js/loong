import { Component, Injectable } from '..';
import { IComponentConstructor } from '../annotations/component';
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
    const component = (TestComponent as IComponentConstructor).createComponent?.();

    expect(component).toBeInstanceOf(ComponentRegistry);
  });

  test('Using actual injection is a different provider', () => {
    const component = (TestComponent as IComponentConstructor).createComponent?.();

    component?.getComponent().loggerService.log();

    expect(console.log).toHaveBeenCalledWith('LoggerServiceImpl');
  });
});
