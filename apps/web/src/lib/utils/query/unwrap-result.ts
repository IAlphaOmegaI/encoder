import type { EmptyObject } from "@zenncore/types";
import type { Result } from "@zenncore/types/utilities";

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : never;
export type UnwrapResult<T> = Exclude<T, { success: false }>;

export const unwrapResult = <F extends () => Promise<Result<EmptyObject>>>(
  fn: F,
) => {
  return async () => {
    const result = await fn();
    if (!result.success) throw new Error(result.error);
    return result.data as UnwrapResult<UnwrapPromise<ReturnType<F>>>["data"];
  };
};
