"use client";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type PaginationState,
  type SortingState,
  type Updater,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ObjectWithPossibleOptionalKeys } from "@zenncore/types";
import { useState } from "react";
import type { TableRow } from "../types";

export type UseDataTableParams<T extends TableRow> = {
  rows: T[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  columns: ColumnDef<T, any>[];
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnsFilterChange?: (filter: ColumnFiltersState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  pageIndex?: number;
  pageSize?: number;
} & (
  | {
      handler?: "client";
    }
  | ({
      handler: "server";
      pageSize: number;
    } & ObjectWithPossibleOptionalKeys<{
      // pageCount will be a client (as in user of the hook) provided value, that means that it'll be 1 based instead of 0 based
      pageCount: number;
      rowCount: number;
    }>)
);

const getOnChangeValue = <P,>(updaterOrValue: Updater<P>, previousState: P) => {
  return typeof updaterOrValue === "function"
    ? (updaterOrValue as (value: P) => P)(previousState)
    : updaterOrValue;
};
const normalizePagination = (pagination: PaginationState) => {
  return {
    ...pagination,
    // due to the nature of the tanstack useReactTable hook, we need to move to a 0 base index instead of 1 base that we use to interface with the client
    pageIndex: pagination.pageIndex - 1,
  };
};

export const useDataTable = <T extends TableRow>({
  rows,
  columns,
  onPaginationChange,
  onSortingChange,
  onColumnsFilterChange,
  onExpandedChange,
  // 1-based indexing for the pagination interfacing
  pageIndex = 1,
  pageSize = 20,
  ...params
}: UseDataTableParams<T>) => {
  // this is a special implementation as it is not a direct interface with the tanstack useReactTable hook, it uses 1-based indexing
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const isServerSide = params.handler === "server";

  const pageCount = isServerSide
    ? params.pageCount !== undefined
      ? params.pageCount
      : // biome-ignore lint/style/noNonNullAssertion: if row count is undefined, row count will always be defined
        Math.ceil(params.rowCount! / pageSize)
    : Math.ceil(rows.length / pageSize);

  const table = useReactTable<T>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServerSide ? getFilteredRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: isServerSide ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
    getSubRows: (row) => row.subRows as T[],
    onPaginationChange: (updaterOrValue) => {
      const value = getOnChangeValue(
        updaterOrValue,
        normalizePagination(pagination),
      );
      // when we interface with the onPaginationChange callback, we will need to move to a 1 base index instead of 0 base that tanstack uses
      const newValue = { ...value, pageIndex: value.pageIndex + 1 };
      setPagination(newValue);
      onPaginationChange?.(newValue);
    },
    onColumnFiltersChange: (updaterOrValue) => {
      const value = getOnChangeValue(updaterOrValue, columnFilters);
      setColumnFilters(value);
      onColumnsFilterChange?.(value);
    },
    onSortingChange: (updaterOrValue) => {
      const value = getOnChangeValue(updaterOrValue, sorting);
      setSorting(value);
      onSortingChange?.(value);
    },
    onExpandedChange: (updaterOrValue) => {
      const value = getOnChangeValue(updaterOrValue, expanded);
      setExpanded(value);
      onExpandedChange?.(value);
    },
    state: {
      pagination: normalizePagination(pagination),
      sorting,
      columnFilters,
      expanded,
    },
    ...params,
  });

  return {
    table,
    pagination: Object.assign(pagination, {
      canGoNextPage: table.getCanNextPage(),
      canGoPreviousPage: table.getCanPreviousPage(),
      goToNextPage: table.nextPage,
      goToPreviousPage: table.previousPage,
      goToFirstPage: table.firstPage,
      goToLastPage: table.lastPage,
      // accounting for the fact that our outside interface is 1 based
      goToPage: (pageIndex: number) => table.setPageIndex(pageIndex - 1),
      setPageSize: table.setPageSize,
      pageCount,
    }),
  };
};
