export type IsRequired<T, K extends keyof T> = undefined extends T[K]
  ? false
  : true;
