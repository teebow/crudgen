import { keycloakConfig } from "./keycloak";

const createBaseUrl = (): string =>
  `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect`;

export const getEndpoints = () => {
  const baseURL = createBaseUrl();
  return {
    token: `${baseURL}/token`,
    userInfo: `${baseURL}/userinfo`,
    logout: `${baseURL}/logout`,
  };
};
