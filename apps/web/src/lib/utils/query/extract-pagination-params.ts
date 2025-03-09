import type { SearchParams } from "@zenncore/types/navigation";
import { parseSearchParams } from "./parse-search-params";

type PaginationParams = SearchParams<"limit" | "page">;

export const extractPaginationParams = ({ limit, page }: PaginationParams) => {
  return {
    page: Number(parseSearchParams(page, "single", "1")),
    limit: Number(parseSearchParams(limit, "single", "20")),
  };
};
