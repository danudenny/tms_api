import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PinoLoggerService } from '../services/pino-logger.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthTmsGuard implements CanActivate {
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
          //   Tms: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImludGVybmFsIiwiY2xpZW50IjoiVG1zIn0.NEt8Kie5G6jUdE0IT1fRpG5i6M0fr9nPahf1zTMvq3w
          const accessTokenJwtPayload = this.jwtService.verify(
            accessToken,
          );
          // token only client Internal
          const validClient =
            accessTokenJwtPayload.client == 'Tms' ? true : false;
          return validClient;
        } catch (e) {
      PinoLoggerService.log(e.message);
      throw new UnauthorizedException(e.message);
    }
  }
}
