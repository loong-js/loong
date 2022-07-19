export function warn(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[@loong-js/observer]: ${message}`);
  }
}
