import {
    type QueryKey,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import type {Result} from "@zenncore/types/utilities";

import type {MutationFnParams} from "@/hooks/use-resource-mutation";
import type {
    OmitSystemFields,
    SystemFields,
} from "@/server/types/system";
import {toast} from "sonner";
import type {Paginated} from "@/server/types/pagination";

export type MutableCollectionData = { id: string } & Record<string, unknown>;

type UseOptimisticMutationParams<
    T extends MutableCollectionData,
    CreateFnParams = Omit<T, keyof SystemFields>,
    UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
> = {
    deleteFn?: (id: string) => Promise<Result>;
    createFn?: (data: CreateFnParams) => Promise<Result>;
    updateFn?: (id: string, data: UpdateFnParams) => Promise<Result>;
    queryKey: QueryKey;
    strategies?: Partial<MergeStrategies<T, CreateFnParams, UpdateFnParams>>;
};

type MergeStrategies<
    T extends MutableCollectionData,
    CreateFnParams = Omit<T, keyof SystemFields>,
    UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
> = {
    handleCreate: (
        data: OmitSystemFields<CreateFnParams>,
        context: (T & SystemFields)[],
    ) => T & SystemFields;
    handleUpdate: (
        id: string,
        previousData: T & SystemFields,
        data: OmitSystemFields<UpdateFnParams>,
        context: (T & SystemFields)[],
    ) => T & SystemFields;
};

type MutationFn<
    T extends MutableCollectionData,
    CreateFnParams = Omit<T, keyof SystemFields>,
    UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
> = (
    params: MutationFnParams<T, CreateFnParams, UpdateFnParams>,
) => Promise<Result>;

export const getDefaultStrategies = <
    T extends MutableCollectionData,
    CreateFnParams = Omit<T, keyof SystemFields>,
    UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
>(): MergeStrategies<T, CreateFnParams, UpdateFnParams> => ({
    handleCreate: (data) => data as unknown as T & SystemFields,
    handleUpdate: (_, previousData, data) =>
        ({
            ...previousData,
            ...data,
        }) as unknown as T & SystemFields,
});
export const useCollectionMutation = <
    T extends MutableCollectionData,
    CreateFnParams = Omit<T, keyof SystemFields>,
    UpdateFnParams = Partial<Omit<T, keyof SystemFields>>,
>({
      queryKey,
      createFn,
      updateFn,
      deleteFn,
      strategies: inherited = getDefaultStrategies(),
  }: UseOptimisticMutationParams<T, CreateFnParams, UpdateFnParams>): MutationFn<
    T,
    CreateFnParams,
    UpdateFnParams
> => {
    const strategies: MergeStrategies<T, CreateFnParams, UpdateFnParams> = {
        ...getDefaultStrategies(),
        ...inherited,
    };

    const queryClient = useQueryClient();
    const operation = useMutation({
        mutationFn: async (
            params: MutationFnParams<T, CreateFnParams, UpdateFnParams>,
        ): Promise<Result> => {
            const result = await (() => {
                switch (params.action) {
                    case "create": {
                        return createFn?.(params.data as CreateFnParams);
                    }
                    case "update": {
                        return updateFn?.(params.id, params.data as UpdateFnParams);
                    }
                    case "delete": {
                        return deleteFn?.(params.id);
                    }
                }
            })();

            if (!result?.success)
                throw new Error(
                    `Failed to operate: ${result?.error ?? "Unknown error"}`,
                );

            return result;
        },
        onMutate: async (params) => {
            await queryClient.cancelQueries({
                queryKey,
            });

            const previousData = (queryClient.getQueryData(queryKey) ?? {
                items: [] as (T & SystemFields)[],
                metadata: {
                    page: 1,
                    limit: 20,
                    pageCount: 1,
                    itemCount: 1
                },
            }) satisfies Paginated<T & SystemFields>;

            const previousRecords = previousData.items;

            const updatedRecords: Paginated<T & SystemFields> = (() => {
                switch (params.action) {
                    case "create": {
                        const newRecord = strategies.handleCreate(
                            params.data,
                            previousRecords,
                        );
                        return {
                            ...previousData, metadata: {
                                ...previousData.metadata,
                                itemCount: previousData.metadata.itemCount + 1,
                                pageCount: (previousData.metadata.itemCount + 1 / previousData.metadata.limit)
                            }, items: [newRecord, ...previousRecords]
                        };
                    }
                    case "update": {
                        const previousRecord = previousRecords.find(
                            (data) => data._id === params.id,
                        ) as T & SystemFields;

                        if (!previousRecord)
                            throw new Error("Record not found in the collection");

                        const newRecord = strategies.handleUpdate(
                            params.id,
                            previousRecord,
                            params.data,
                            previousRecords,
                        );
                        return {
                            ...previousData,
                            items: previousRecords.map((data) =>
                                data._id === params.id ? newRecord : data,
                            ),
                        };
                    }
                    case "delete": {
                        return {
                            ...previousData,
                            items: previousRecords.filter((data) => data._id !== params.id),
                        };
                    }
                }
            })();


            console.log("SETTING NEW DATA", updatedRecords);
            queryClient.setQueryData(queryKey, updatedRecords);

            return {
                previousData,
                updatedRecords,
            };
        },
        onError: (error, _variables, context) => {
            if (context) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            toast.error("Failed to operate", {description: error.message});
        },
        onSettled: () => {
            return () => {
                queryClient.invalidateQueries({
                    queryKey,
                });
            };
        },
    });

    return operation.mutateAsync;
};
