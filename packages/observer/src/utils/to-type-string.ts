const objectToString = Object.prototype.toString;

export function toTypeString(value: unknown): string {
  return objectToString.call(value);
}
