"use client";
import type { Table } from "@tanstack/react-table";
import {
  type Context,
  type PropsWithChildren,
  createContext,
  useContext,
} from "react";
import { type UseDataTableParams, useDataTable } from "./hooks/use-data-table";
import type { Pagination, TableRow } from "./types";

export type DataTableContextValue<R extends TableRow> = {
  table: Table<R>;
  pagination: Pagination;
};

// biome-ignore lint/suspicious/noExplicitAny: we do an assertion later
const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

export type DataTableProviderProps<R extends TableRow> = PropsWithChildren<
  UseDataTableParams<R>
>;

export const DataTableProvider = <R extends TableRow>({
  children,
  ...props
}: DataTableProviderProps<R>) => {
  const value = useDataTable<R>(props);

  const Context = DataTableContext as Context<DataTableContextValue<R>>;

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useDataTableContext = <R extends TableRow>() => {
  const Context = DataTableContext as Context<DataTableContextValue<R>>;
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "useDataTableContext and DataTable composition components must be used within a DataTableProvider",
    );
  }

  return context;
};
