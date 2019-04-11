export interface JwtAccessTokenPayload {
  clientId: string;
  userId: string;
  roles: string[];
  rolesPermissionNames: string[];
}

export interface JwtRefreshTokenPayload {
  clientId: string;
  userId: string;
}
