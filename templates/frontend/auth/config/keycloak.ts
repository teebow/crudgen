export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
}

export const keycloakConfig: KeycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'master',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'react-app',
  clientSecret: process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET,
};