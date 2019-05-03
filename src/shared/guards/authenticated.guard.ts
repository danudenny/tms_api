import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    Logger.log('########### canActive =======================');
    Logger.log(AuthService.isLoggedIn);

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
      Logger.log('########### accessToken =====================');
      Logger.log(accessToken);
      const accessTokenJwtPayload = this.jwtService.verify(accessToken);

      Logger.log('########### Payload ===================== ');
      Logger.log(accessTokenJwtPayload);

      return Boolean(accessTokenJwtPayload);
    } catch (e) {
      Logger.log(e.message);

      throw new UnauthorizedException(e.message);
    }
  }
}
