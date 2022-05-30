export function schedule(callback: Function) {
  window.requestAnimationFrame(() => callback());
}
