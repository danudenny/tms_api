import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PinoLoggerService } from '../services/pino-logger.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthFastpayGuard implements CanActivate {
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
          // singleToken:
          //   Fastpay: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6InBhcnRuZXIiLCJjbGllbnQiOiJGYXN0cGF5In0.gn4vt7NJU00db6IkCQT5JnN1orrPM1PrJcGviCk8Mso
          const accessTokenJwtPayload = this.jwtService.verify(
            accessToken,
          );
          // token only client Fastpay
          const validClient =
            accessTokenJwtPayload.client == 'Fastpay' ? true : false;
          return validClient;
        } catch (e) {
      PinoLoggerService.log(e.message);
      throw new UnauthorizedException(e.message);
    }
  }
}
