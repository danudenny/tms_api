import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAccessTokenPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: () => void) {
    if (req.headers && req.headers['authorization']) {
      RequestContextMetadataService.setMetadata(
        'REQUEST_AUTH_METHOD',
        'JWT_TOKEN',
      );
      const jwtToken = req.headers['authorization'].replace(/^Bearer\s+/, '');

      Logger.log('################ JWT TOKEN =======================================');
      Logger.log(jwtToken);
      await this.handleJwtToken(jwtToken);
    }
    next();
  }

  async handleJwtToken(jwtToken: string) {
    Logger.log('##### handleJwtToken =========================================');

    let jwt: { payload: JwtAccessTokenPayload };
    try {
      jwt = this.jwtService.decode(jwtToken, {
        complete: true,
      }) as { payload: JwtAccessTokenPayload };

      Logger.log('### JWT ====================================================');
      Logger.log(jwt);

    } catch (error) {
      Logger.log('UnauthorizedException ====================================');
      throw new UnauthorizedException();
    }

    RequestContextMetadataService.setMetadata('JWT_ACCESS_TOKEN', jwtToken);
    RequestContextMetadataService.setMetadata(
      'JWT_ACCESS_TOKEN_PAYLOAD',
      jwt.payload,
    );
    // AuthService.setAuthMetadata({
    //   clientId: jwt.payload.clientId,
    //   userId: jwt.payload.userId,
    //   accessToken: jwtToken,
    //   roles: jwt.payload.roles,
    //   rolesPermissionNames: jwt.payload.rolesPermissionNames,
    // });
  }
}
