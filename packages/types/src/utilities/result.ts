import type { EmptyObject } from "../domain";

export type Result<T = undefined, E = string> =
  | ({
      success: true;
    } & (T extends undefined ? EmptyObject : { data: T }))
  | {
      success: false;
      error: E;
    };
