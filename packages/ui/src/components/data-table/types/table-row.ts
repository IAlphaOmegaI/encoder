import type { RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { AdditionalTableRowProperties } from "./additional-table-row-properties";

export type TableRow = AdditionalTableRowProperties &
  RowData & {
    subRows?: TableRow[];
    content?: ReactNode;
    isContentShown?: boolean;
  };
