import type { SearchParams } from "./search-params";

export type SearchParamProps<T extends string> = {
  searchParams: Promise<SearchParams<T>>;
};
