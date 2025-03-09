import type { EmptyObject } from "../domain";

export type OptionalIfEmpty<
  ShouldEnforce extends boolean,
  WhatToEnforce extends EmptyObject,
> = ShouldEnforce extends false
  ? { [K in keyof WhatToEnforce]?: never } // Make the field optional and `never` if T is EmptyObject
  : WhatToEnforce; // Otherwise, require the field
