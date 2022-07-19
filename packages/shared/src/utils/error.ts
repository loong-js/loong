export function error(message: string, scope: string) {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`[@loong-js/${scope}]: ${message}`);
  }
}

export function createError(scope: string) {
  return (message: string) => error(message, scope);
}
