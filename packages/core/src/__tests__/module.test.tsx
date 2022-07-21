import { Module, Injectable } from '..';
import { ModuleConstructor } from '../annotations/module';
import { ModuleRegistry } from '../module-registry';

abstract class LoggerService {
  abstract log(): void;
}

@Injectable()
class LoggerServiceImpl implements LoggerService {
  log() {
    console.log('LoggerServiceImpl');
  }
}

@Module({
  providers: [
    {
      provide: LoggerService,
      useClass: LoggerServiceImpl,
    },
  ],
})
class TestModule {
  constructor(public loggerService: LoggerService) {
    // noop
  }
}

describe('Injectable', () => {
  test('Using injected services', () => {
    const component = (TestModule as ModuleConstructor).create?.();

    expect(component).toBeInstanceOf(ModuleRegistry);
  });

  test('Using actual injection is a different provider', () => {
    const component = (TestModule as ModuleConstructor).create?.();

    component?.getModule().loggerService.log();

    expect(console.log).toHaveBeenCalledWith('LoggerServiceImpl');
  });
});
