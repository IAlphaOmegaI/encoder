"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./data-table-primitive";

import { cn } from "../../lib/utils";
import { flexRender } from "@tanstack/react-table";
import type { ClassList } from "@zenncore/types";
import { Fragment } from "react";
import { useDataTableContext } from "./data-table-provider";

type DataTableSector = "row" | "cell" | "footer" | "table";
type DataTablePosition = "header" | "body" | "footer";
type DataTableClassListKey =
  | `${DataTablePosition}-${DataTableSector}`
  | "table";

export type DataTableProps = {
  classList?: ClassList<DataTableClassListKey>;
  className?: string;
};
export const DataTable = ({ className, classList }: DataTableProps) => {
  const { table } = useDataTableContext();
  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="bg-background-dimmed">
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={classList?.["header-cell"]}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const rowData = row.original;

            return (
              <Fragment key={row.original.id.toString()}>
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  className={cn("relative z-10", classList?.["body-row"])}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("relative", classList?.["body-cell"])}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <AnimatePresence>
                  {rowData.content && rowData.isContentShown && (
                    <motion.tr
                      key={rowData.id.toString()}
                      className={cn(
                        "-z-[10] border-border border-b transition-colors odd:bg-background-dimmed hover:bg-accent-rich data-[state=selected]:bg-accent-rich",
                      )}
                    >
                      <TableCell
                        colSpan={Object.keys(rowData).length}
                        className={cn("p-0", classList?.["body-cell"])}
                      >
                        <motion.div
                          key={rowData.id.toString()}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          {rowData.content}
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getAllColumns().length}
              className={cn("h-24 text-center")}
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
