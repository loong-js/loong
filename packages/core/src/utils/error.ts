export function error(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`[@loong/core]: ${message}`);
  }
}
