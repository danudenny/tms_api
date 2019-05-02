/**
 * The data object encrypt on the access token
 * @export
 * @interface JwtAccessTokenPayload
 */
export interface JwtAccessTokenPayload {
  clientId: string;
  userId: string;
  branchId: string;
  roles: string[];
  rolesPermissionNames: string[];
}

/**
 * The data object encrypt on the refresh token
 * @export
 * @interface JwtRefreshTokenPayload
 */
export interface JwtRefreshTokenPayload {
  clientId: string;
  userId: string;
}
