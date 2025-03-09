"use client";

import type { PropsWithChildren } from "react";
import { Sheet } from "@zenncore/ui/components/sheet";
import { useRouter } from "next/navigation";

export const ActionSheet = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };
  return (
    <Sheet onOpenChange={handleOpenChange} defaultOpen>
      {children}
    </Sheet>
  );
};
