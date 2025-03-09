"use client";

import { unwrapResult } from "@/lib/utils/query";
import type { Pager } from "@/server/types/pagination";
import { useQuery } from "@tanstack/react-query";
import type { PropsWithClassName } from "@zenncore/types/components";
import { getAllRecordings, type Recording } from "@/server/recordings";
import { DataTableProvider } from "@zenncore/ui/components/data-table/data-table-provider";
import { DataTablePagination } from "@zenncore/ui/components/data-table/data-table-pagination";
import { DataTable } from "@zenncore/ui/components/data-table/data-table";
import { createColumnHelper } from "@tanstack/react-table";

type RecordingsTableProps = PropsWithClassName<{
  pager: Pager;
}>;
export const RecordingsTable = ({ pager, className }: RecordingsTableProps) => {
  const { data } = useQuery({
    queryKey: ["recordings", pager],
    queryFn: unwrapResult(() => getAllRecordings(pager)),
    throwOnError: true,
  });

  if (!data) return null;

  return (
    <DataTableProvider
      columns={columns}
      rows={data.items}
      handler="server"
      pageSize={data.metadata.limit}
      pageIndex={data.metadata.page}
      pageCount={data.metadata.pageCount}
    >
      <DataTable
        className={className}
        classList={{
          "header-cell":
            "whitespace-nowrap pb-0 font-bold text-foreground-dimmed uppercase",
        }}
      />
      <DataTablePagination className="ml-auto" />
    </DataTableProvider>
  );
};

const column = createColumnHelper<Recording>();

const columns = [
  column.accessor("id", {
    header: "ID",
    cell: ({ row }) => row.original.id,
  }),
  column.accessor("filename", {}),
  column.accessor("created_at", {}),
  column.accessor("duration", {
    cell: ({ getValue }) => getValue().toFixed(2),
  }),
];
