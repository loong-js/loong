export function shouldInstrument(target: object) {
  if (Object.isExtensible(target)) {
    return false;
  }
}
