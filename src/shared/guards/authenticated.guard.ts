import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PinoLoggerService } from '../services/pino-logger.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
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
      // PinoLoggerService.log('########### accessToken =====================');
      // PinoLoggerService.log(accessToken);
      const accessTokenJwtPayload = this.jwtService.verify(accessToken);
      // PinoLoggerService.log('########### Payload ===================== ');
      // PinoLoggerService.log(accessTokenJwtPayload);

      return Boolean(accessTokenJwtPayload);
    } catch (e) {
      PinoLoggerService.log(e.message);

      throw new UnauthorizedException(e.message);
    }
  }
}
