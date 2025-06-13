import axios, { AxiosResponse } from "axios";
import { LoginCredentials, TokenResponse, User } from "../types/auth";
import { keycloakConfig } from "../config/keycloak";
import { getEndpoints } from "../utils/keycloakEndpoints";
import {
  storeTokens,
  getRefreshToken,
  clearTokens,
  getAccessToken,
} from "../utils/tokenStorage";
import { mapKeycloakUserToUser } from "../utils/userMapper";
import { httpClient } from "./httpClient";

const createTokenParams = (
  baseParams: Record<string, string>
): URLSearchParams => {
  const params = new URLSearchParams(baseParams);
  params.append("client_id", keycloakConfig.clientId);

  if (keycloakConfig.clientSecret) {
    params.append("client_secret", keycloakConfig.clientSecret);
  }

  return params;
};

const makeTokenRequest = async (
  params: URLSearchParams
): Promise<TokenResponse> => {
  const endpoints = getEndpoints();
  const response: AxiosResponse<TokenResponse> = await axios.post(
    endpoints.token,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
};

export const loginWithCredentials = async (
  credentials: LoginCredentials
): Promise<TokenResponse> => {
  const params = createTokenParams({
    grant_type: "password",
    username: credentials.username,
    password: credentials.password,
    scope: "openid profile email",
  });

  const tokenResponse = await makeTokenRequest(params);
  storeTokens(tokenResponse);
  return tokenResponse;
};

export const refreshTokens = async (): Promise<TokenResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = createTokenParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const tokenResponse = await makeTokenRequest(params);
  storeTokens(tokenResponse);
  return tokenResponse;
};

export const fetchUserInfo = async (): Promise<User> => {
  const endpoints = getEndpoints();
  const response: AxiosResponse<any> = await httpClient.get(endpoints.userInfo);
  return mapKeycloakUserToUser(response.data);
};

export const logoutUser = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  const endpoints = getEndpoints();

  if (refreshToken) {
    const params = createTokenParams({
      refresh_token: refreshToken,
    });

    try {
      await axios.post(endpoints.logout, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      console.warn("Logout request failed:", error);
    }
  }

  clearTokens();
};

export const checkTokenValidity = (): boolean => {
  return getAccessToken() !== null;
};
