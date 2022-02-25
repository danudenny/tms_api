import { AuthLoginMetadata } from './auth-login-metadata.model';

export class AuthLoginResultMetadata extends AuthLoginMetadata {
  email: string;
  refreshToken: string;
}

export class AuthLoginResultMetadataV2 extends AuthLoginMetadata {
  email: string;
  refreshToken: string;
  statusCode: number;
}
