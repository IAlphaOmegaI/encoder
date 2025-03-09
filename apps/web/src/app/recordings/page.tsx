import { extractPaginationParams, unwrapResult } from "@/lib/utils/query";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import type { SearchParamProps } from "@zenncore/types/navigation";
import type {  Pager } from "@/server/types/pagination";
import { Button } from "@zenncore/ui/components/button";
import { Suspense } from "react";
import { getAllRecordings } from "@/server/recordings";
import { RecordingsTable } from "@/components/recordings-table";
import {FileMusicIcon} from "lucide-react";
import Link from "next/link";

export default async ({ searchParams }: SearchParamProps<keyof Pager>) => {
  const pager = extractPaginationParams(await searchParams);

  const client = new QueryClient();

  client.prefetchQuery({
    queryKey: ["recordings", pager],
    queryFn: unwrapResult(() => getAllRecordings(pager)),
    staleTime: 60000,
  });

  return (
    <main className="flex size-full flex-col gap-4 p-8">
      <div className={"flex h-12 items-center gap-6 justify-between"}>
        <h1 className={"font-semibold text-4xl"}>Content</h1>
        <Link href={"/recordings/new"}>
          <Button>
          <FileMusicIcon strokeWidth={1.5}/>
          Add New Recording
        </Button>
        </Link>
      </div>
      <Suspense fallback={"Loading..."}>
        <HydrationBoundary state={dehydrate(client)}>
          <RecordingsTable pager={pager} />
        </HydrationBoundary>
      </Suspense>
    </main>
  );
};
