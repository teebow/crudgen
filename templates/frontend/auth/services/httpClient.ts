import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens } from '../utils/tokenStorage';
import { refreshTokens } from './keycloakService';

const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !config.url?.includes('/token')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  // Response interceptor
  const responseInterceptor = (response: AxiosResponse) => response;

  const errorInterceptor = async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshTokens();
        const token = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  };

  client.interceptors.request.use(requestInterceptor);
  client.interceptors.response.use(responseInterceptor, errorInterceptor);

  return client;
};

export const httpClient = createHttpClient();