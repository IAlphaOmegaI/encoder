// biome-ignore lint/suspicious/noExplicitAny: utility type
export type IsDiscriminativeUnion<T, K extends keyof T> = T extends any
  ? (K extends keyof T ? T[K] : never) extends infer D
    ? [D] extends [never]
      ? false
      : true
    : never
  : never;
