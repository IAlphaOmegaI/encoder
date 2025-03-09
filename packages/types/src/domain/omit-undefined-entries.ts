import type { EmptyObject } from "./empty-object";

export type OmitUndefinedEntries<T extends EmptyObject> = {
  [K in keyof T as T[K] extends undefined | "" | null ? never : K]: T[K];
};
