import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from './api-client';
import type { QueryOptions } from '@dto/common/query.dto';

export const useApi = (entity: string) => {
  const queryClient = useQueryClient();

  return {
    useGetOne: <T>(id: number) => {
      return useQuery({
        queryKey: [entity, id],
        queryFn: () => clientApi.get<T>(`/${entity}/${id}`),
      });
    },
    useList: <T>(query?: QueryOptions) => {
      return useQuery({
        queryKey: [entity, query],
        queryFn: () => clientApi.get<T[]>(`/${entity}`, query),
      });
    },

    useCreate: <T>() => {
      return useMutation({
        mutationFn: (newData: Partial<T>) => clientApi.post<T>(`/${entity}`, newData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
      });
    },

    useUpdate: <T>() => {
      return useMutation({
        mutationFn: ({ id, ...data }: Partial<T> & { id: number }) =>
          clientApi.patch<T>(`/${entity}/${id}`, data as Partial<T>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
      });
    },

    useDelete: () => {
      return useMutation({
        mutationFn: (id: number) => clientApi.delete(`/${entity}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [entity] }),
      });
    },
  };
};
