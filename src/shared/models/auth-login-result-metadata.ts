import { AuthLoginMetadata } from './auth-login-metadata.model';

export class AuthLoginResultMetadata extends AuthLoginMetadata {
  email: string;
  refreshToken: string;
}
