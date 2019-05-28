/**
 * The data object encrypt on the access token
 * @export
 * @interface JwtAccessTokenPayload
 */
export interface JwtAccessTokenPayload {
  clientId: string;
  userId: number;
  email: string;
  username: string;
  displayName: string;
  employeeId: number;
  branchId: string;
  roles: object[];
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
