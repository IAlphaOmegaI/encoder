// biome-ignore lint/suspicious/noExplicitAny: utility type
export type NoDistribute<T> = [T] extends [any] ? T : never;
