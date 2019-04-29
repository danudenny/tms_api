import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';


@Injectable()
export class AuthenticatedGuard implements CanActivate {
  // constructor(private readonly jwtService: JwtService) {}
  constructor(@Inject(forwardRef(() => AuthenticatedGuard)) private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return AuthService.isLoggedIn && this.hasValidCredentials();
  }

  private hasValidCredentials(): boolean {
    switch (RequestContextMetadataService.getMetadata('REQUEST_AUTH_METHOD')) {
      case 'JWT_TOKEN':
        return this.validateJwtTokenAuthMethod();
    }

    return true;
  }

  private validateJwtTokenAuthMethod(): boolean {
    const accessToken = RequestContextMetadataService.getMetadata(
      'JWT_ACCESS_TOKEN',
    );
    try {
      const accessTokenJwtPayload = this.jwtService.verify(accessToken);
      return Boolean(accessTokenJwtPayload);
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
