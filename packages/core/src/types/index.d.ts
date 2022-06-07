declare namespace LoongCore {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface IHookParameters {}
}

declare interface IBabelPropertyDescriptor extends PropertyDescriptor {
  initializer?: () => any;
}

declare type ClassInstance<T extends { new (...args: any): any }> = T extends {
  new (...args: any): infer R;
}
  ? R
  : any;
