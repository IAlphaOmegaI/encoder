import type { Result, Tuple } from "@zenncore/types/utilities";

import type {
  OmitSystemFields,
  SystemFields,
} from "@/server/types/system";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { toast } from "sonner";

export type MutableData = Record<string, unknown>;
export type MutationAction = "create" | "update" | "delete" | null;

export type MutationFnParams<
  T extends MutableData,
  CreateFnParams = Omit<T, keyof SystemFields>,
  UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
> =
  | { action: "create"; data: OmitSystemFields<CreateFnParams> }
  | {
    action: "update";
    id: string;
    data: OmitSystemFields<UpdateFnParams>;
  }
  | { id: string; action: "delete" };

export type UseResourceMutationParams<
  T extends MutableData,
  CreateFnParams = Omit<T, keyof SystemFields>,
  UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
> = {
  deleteFn?: (id: string) => Promise<Result>;
  createFn?: (data: CreateFnParams) => Promise<Result>;
  updateFn?: (id: string, data: UpdateFnParams) => Promise<Result>;
  onSettle?: (action: MutationAction) => void;
  queryKey: Tuple<string>;
  preventRefetch?: boolean;
  throwOnException?: boolean;
};
export const useResourceMutation = <
  T extends MutableData,
  CreateFnParams = Omit<T, keyof SystemFields>,
  UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
>({
  createFn,
  updateFn,
  deleteFn,
  queryKey,
  onSettle,
  preventRefetch,
  throwOnException,
}: UseResourceMutationParams<T, CreateFnParams, UpdateFnParams>) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const mutate = async (params: MutationFnParams<T>) => {
    startTransition(async () => {
      const result = await (async () => {
        switch (params.action) {
          case "create": {
            if (!createFn) throw new Error("No Create Function provided");
            return await createFn(params.data as CreateFnParams);
          }
          case "update": {
            if (!updateFn) throw new Error("No Update Function provided");
            return await updateFn(params.id, params.data as UpdateFnParams);
          }
          case "delete": {
            if (!deleteFn) throw new Error("No Delete Function provided");
            return await deleteFn(params.id);
          }
        }
      })();

      if (!result?.success) {
        const message = `Failed to operate: ${result?.error ?? "Unknown error"}`;
        if (throwOnException) throw new Error(message);
        toast.error(message);
      }

      if (!preventRefetch)
        await queryClient.refetchQueries({
          queryKey,
        });
      onSettle?.(params.action);
    });
  };
  return {
    isPending,
    mutate,
  };
};
