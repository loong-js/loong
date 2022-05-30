export const hasOwnProperty = (target: object, key: string | symbol): key is keyof typeof target =>
  Object.prototype.hasOwnProperty.call(target, key);
