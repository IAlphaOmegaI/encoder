import { ActionSheet } from "@/components/action-sheet";
import { Suspense } from "react";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@zenncore/ui/components/sheet";
import {RecordingsForm} from "@/components/recordings-form";

export default async () => {

  return (
    <ActionSheet>
      <SheetContent className="gap-6 flex flex-col">
        <div className="flex justify-end pb-4 border-b border-border">
          <SheetClose />
        </div>
        <SheetHeader>
          <SheetTitle>New Recording</SheetTitle>
          <SheetDescription>
           Add a new recording to be encoded and saved into the backend.
          </SheetDescription>
        </SheetHeader>
        <Suspense>
          <RecordingsForm/>
        </Suspense>
      </SheetContent>
    </ActionSheet>
  );
};
