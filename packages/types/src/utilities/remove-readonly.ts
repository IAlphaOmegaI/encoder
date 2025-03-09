import type { UnionToTuple } from "./union-to-tuple";

export type RemoveReadonly<T> = T extends readonly (infer U)[]
  ? UnionToTuple<U>
  : never;
