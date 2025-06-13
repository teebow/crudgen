import { useCallback } from "react";
import { LoginCredentials, User } from "../types/auth";
import { checkTokenValidity } from "../services/keycloakService";
import { useAuthQueries } from "./useAuthQueries";
import { useTokenRefresh } from "./useTokenRefresh";

export const useAuth = () => {
  const { userQuery, loginMutation, logoutMutation, refreshMutation } =
    useAuthQueries();

  const isAuthenticated = !!userQuery.data && checkTokenValidity();

  // Auto-refresh tokens
  useTokenRefresh(isAuthenticated);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const logout = useCallback((): void => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const refreshToken = useCallback(async (): Promise<void> => {
    await refreshMutation.mutateAsync();
  }, [refreshMutation]);

  const hasRole = useCallback(
    (role: string): boolean => {
      return userQuery.data?.roles?.includes(role) || false;
    },
    [userQuery.data?.roles]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  return {
    user: userQuery.data || null,
    isAuthenticated,
    isLoading: userQuery.isLoading || loginMutation.isPending,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    loginError: loginMutation.error,
    isLoginLoading: loginMutation.isPending,
  };
};
