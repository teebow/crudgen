// src/api/clientApi.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const clientApi = {
  get: async <T>(url: string, params?: object): Promise<T> => {
    const response = await api.get<T>(url, { params });
    return response.data;
  },

  post: async <T>(url: string, data: Partial<T>): Promise<T> => {
    const response = await api.post<T>(url, data);
    return response.data;
  },

  patch: async <T>(url: string, data: Partial<T>): Promise<T> => {
    const response = await api.patch<T>(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url);
    return response.data;
  },
};
