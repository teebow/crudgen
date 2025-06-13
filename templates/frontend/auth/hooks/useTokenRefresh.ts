import { useEffect, useRef } from "react";
import { refreshTokens } from "../services/keycloakService";

const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes

export const useTokenRefresh = (isAuthenticated: boolean) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const refreshTokenPeriodically = async () => {
      try {
        await refreshTokens();
      } catch (error) {
        console.error("Periodic token refresh failed:", error);
      }
    };

    intervalRef.current = setInterval(
      refreshTokenPeriodically,
      TOKEN_REFRESH_INTERVAL
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]);
};
