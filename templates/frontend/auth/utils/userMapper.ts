import { User } from "../types/auth";

export const mapKeycloakUserToUser = (keycloakUser: any): User => ({
  id: keycloakUser.sub,
  username: keycloakUser.preferred_username || keycloakUser.username,
  email: keycloakUser.email,
  firstName: keycloakUser.given_name,
  lastName: keycloakUser.family_name,
  roles: keycloakUser.realm_access?.roles || [],
  groups: keycloakUser.groups || [],
});
