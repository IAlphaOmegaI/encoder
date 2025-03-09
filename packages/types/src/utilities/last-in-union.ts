import type { UnionToIntersection } from "./union-to-intersection";

export type LastInUnion<U> = UnionToIntersection<
  U extends unknown ? () => U : never
> extends () => infer R
  ? R
  : never;
