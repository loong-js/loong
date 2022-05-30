declare namespace LoongCore {
  export interface IHookParameters {
    setup(): void;
    mounted(): void;
    unmount(): void;
  }
}
