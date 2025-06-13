import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginWithCredentials,
  logoutUser,
  refreshTokens,
  fetchUserInfo,
  checkTokenValidity,
} from "../services/keycloakService";
import { LoginCredentials } from "../types/auth";

const AUTH_QUERY_KEY = ["auth", "user"];
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAuthQueries = () => {
  const queryClient = useQueryClient();

  // User info query
  const userQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchUserInfo,
    enabled: checkTokenValidity(),
    staleTime: TOKEN_REFRESH_INTERVAL,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  // Token refresh mutation
  const refreshMutation = useMutation({
    mutationFn: refreshTokens,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onError: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });

  return {
    userQuery,
    loginMutation,
    logoutMutation,
    refreshMutation,
  };
};
