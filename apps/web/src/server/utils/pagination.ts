import type { Pager } from "../types/pagination";

const normalizeQueryObject = (obj: Record<string, unknown>) => {
  return Object.entries(obj).reduce(
    (accumulator, [key, value]) => {
      if (value !== undefined) accumulator[key.toString()] = String(value);
      return accumulator;
    },
    {} as Record<string, string>,
  );
};

export const buildPaginationQuery = (
  { page = 1, limit = 10 }: Pager,
  additions: Record<string, unknown> = {},
) => {
  return new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...normalizeQueryObject(additions),
  });
};
