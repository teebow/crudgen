import axios from "axios";
import { useState, useEffect } from "react";

export function createApiClient(baseUrl: string) {
  return {
    getAll: <T = any>() =>
      axios.get<T[]>(baseUrl).then((res: { data: any }) => res.data),
    getOne: <T = any>(id: number) =>
      axios.get<T>(`${baseUrl}/${id}`).then((res: { data: any }) => res.data),
    create: <T = any>(data: T) =>
      axios.post<T>(baseUrl, data).then((res: { data: any }) => res.data),
    update: <T = any>(id: number, data: Partial<T>) =>
      axios
        .put<T>(`${baseUrl}/${id}`, data)
        .then((res: { data: any }) => res.data),
    remove: (id: number) =>
      axios.delete(`${baseUrl}/${id}`).then((res: { data: any }) => res.data),
  };
}

export function useApi<T = any>(baseUrl: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<T[]>(baseUrl)
      .then((res: { data: any }) => setData(res.data))
      .finally(() => setLoading(false));
  }, [baseUrl]);

  return { data, loading };
}
