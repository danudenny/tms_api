import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PinoLoggerService } from '../services/pino-logger.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthLocusGuard implements CanActivate {
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
      //   Locus: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6InBhcnRuZXIiLCJjbGllbnQiOiJMb2N1cyJ9.wyPZwKwAGSxPyMj2LIjhb0H3fFkbcBhT9Cr8VxUzeDI
      const accessTokenJwtPayload = this.jwtService.verify(
        accessToken,
      );
      // token only client Locus
      const validClient = accessTokenJwtPayload.client == 'Locus' ? true : false;
      return validClient;
    } catch (e) {
      PinoLoggerService.log(e.message);
      throw new UnauthorizedException(e.message);
    }
  }
}
