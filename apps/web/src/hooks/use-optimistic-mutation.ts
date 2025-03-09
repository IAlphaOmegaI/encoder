import {
  type QueryClient,
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Result } from "@zenncore/types/utilities";
import { toast } from "sonner";

type useOptimisticMutationParams<T, Params> = {
  queryKey: QueryKey;
  revalidateKey?: QueryKey;
  mutationFn: (data: Params) => Promise<Result>;
  reconcolidate?: (previousData: T, data: Params, client: QueryClient) => T;
};

const defaultReconcolidate = <T, Params>(previousData: T, data: Params) => {
  return { ...previousData, ...data } as T;
};

export const useOptimisticMutation = <T, Params>({
  queryKey,
  revalidateKey,
  mutationFn,
  reconcolidate = defaultReconcolidate,
}: useOptimisticMutationParams<T, Params>) => {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Params) => {
      const result = await mutationFn(data);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onMutate: async (data) => {
      await client.cancelQueries({ queryKey });
      const previousData = client.getQueryData<T>(queryKey) ?? {};

      client.setQueryData(queryKey, (previousData: T) => {
        return reconcolidate(previousData, data, client);
      });
      return { previousData };
    },
    onError: (error, _, context) => {
      console.log(error);
      client.setQueryData(queryKey, context?.previousData);
      toast.error(error.message);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: revalidateKey ?? queryKey });
    },
  });

  return mutation;
};
