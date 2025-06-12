// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "./api-client";

export const useApi = <T>(entity: string) => {
  const queryClient = useQueryClient();

  return {
    useList: () => {
      return useQuery({
        queryKey: [entity],
        queryFn: () => clientApi.get<T[]>(`/${entity}`),
      });
    },

    useCreate: () => {
      return useMutation({
        mutationFn: (newData: Partial<T>) =>
          clientApi.post<T>(`/${entity}`, newData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
      });
    },

    useUpdate: () => {
      return useMutation({
        mutationFn: ({ id, ...data }: Partial<T> & { id: string }) =>
          clientApi.put<T>(`/${entity}/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
      });
    },

    useDelete: () => {
      return useMutation({
        mutationFn: (id: string) => clientApi.delete(`/${entity}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
      });
    },
  };
};
