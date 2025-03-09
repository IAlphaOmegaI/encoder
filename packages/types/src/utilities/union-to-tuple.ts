import type { LastInUnion } from "./last-in-union";

export type UnionToTuple<T, L = LastInUnion<T>> = [T] extends [never]
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L];
