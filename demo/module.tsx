import { Component, Injectable, Module } from '@loong-js/core';

// Module 的定位
// Component 的定位，扩展支持组件的特殊 Module，主要扩展 Hooks、Props 等

@Injectable()
class RouterService {}

@Injectable()
class MenuService {}

@Module({
  providers: [
    MenuService,
    {
      provide: RouterService,
      /**
       * self: 自身模块
       * root: 根模块，new Module 的那个模块
      //  * platform: 挂载到全局
       */
      providedIn: 'self',
    },
  ],
})
class MenuModule {}

@Module({
  imports: [MenuModule],
  providers: [RouterService],
})
class AppModule {}

const appModule = run(AppModule);
