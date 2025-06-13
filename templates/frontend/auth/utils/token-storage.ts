import { StoredTokenData, TokenResponse } from '../types/auth';

const TOKEN_STORAGE_KEY = '__auth_tokens__';

export const storeTokens = (tokenResponse: TokenResponse): StoredTokenData => {
  const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
  const refreshExpiresAt = Date.now() + (tokenResponse.refresh_expires_in * 1000);

  const tokenData: StoredTokenData = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    expires_at: expiresAt,
    refresh_expires_at: refreshExpiresAt,
  };

  // Store in memory for this session
  (window as any)[TOKEN_STORAGE_KEY] = tokenData;
  return tokenData;
};

export const getStoredTokens = (): StoredTokenData | null => {
  return (window as any)[TOKEN_STORAGE_KEY] || null;
};

export const getAccessToken = (): string | null => {
  const tokenData = getStoredTokens();
  if (!tokenData || Date.now() >= tokenData.expires_at) {
    return null;
  }
  return tokenData.access_token;
};

export const getRefreshToken = (): string | null => {
  const tokenData = getStoredTokens();
  if (!tokenData || Date.now() >= tokenData.refresh_expires_at) {
    return null;
  }
  return tokenData.refresh_token;
};

export const clearTokens = (): void => {
  delete (window as any)[TOKEN_STORAGE_KEY];
};

export const isTokenValid = (): boolean => {
  return getAccessToken() !== null;
};