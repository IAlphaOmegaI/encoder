import type { IsUnion } from "./is-union";

export type IsUnionOfType<T, Check> = IsUnion<T> extends true
  ? // biome-ignore lint/suspicious/noExplicitAny: it is a utility type
    T extends any
    ? T extends Check
      ? true
      : false
    : never
  : false;
