import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

import { JwtAccessTokenPayload, JwtRefreshTokenPayload } from '../interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../models/auth-login-metadata.model';
import { AuthLoginResultMetadata } from '../models/auth-login-result-metadata';
import { ConfigService } from './config.service';
import { ContextualErrorService } from './contextual-error.service';
import { RequestContextMetadataService } from './request-context-metadata.service';
import { Users } from '../orm-entity/users';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    // @InjectRepository(UserRepository)
    // private readonly userRepository: UserRepository,
    // @InjectRepository(LoginSessionRepository)
    // private readonly loginSessionRepository: LoginSessionRepository,
  ) { }

  async login(
    clientId: string,
    email: string,
    password: string,
  ): Promise<AuthLoginResultMetadata> {

    // TODO: Validate user password

    // TODO: Populate return value by using this.populateLoginResultMetadataByUser

    // NOTE: Test get data and return response data
    const user_id = 1;

    const user = await Users.findOne({
        where: {
          user_id,
        },
      });

    if (user) {
      const loginResultMetadata = this.populateLoginResultMetadataByUser(
        clientId,
        user,
        );
      Logger.log('### Login Result Metadata =======================================================');
      Logger.log(loginResultMetadata);

      return loginResultMetadata;

    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    // return null;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<AuthLoginResultMetadata> {

    let refreshTokenPayload: JwtRefreshTokenPayload;
    try {
      refreshTokenPayload = this.jwtService.verify(refreshToken);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        ContextualErrorService.throw(
          {
            message: '', // TODO: Give message
          },
          HttpStatus.FORBIDDEN,
        );
      } else {
        ContextualErrorService.throw({
          message: '', // TODO: Give message
        });
      }
    }

    // TODO: Call this.populateJwtAccessTokenPayloadFromUser to get new access token

    // TODO: Populate AuthLoginResultMetadata and assign accessToken to the newly generated access token

    return null;
  }

  public populateLoginResultMetadataByUser(
    clientId: string,
    user: Users,
  ) {
    const jwtAccessTokenPayload = this.populateJwtAccessTokenPayloadFromUser(
      clientId,
      user,
    );

    const accessToken = this.jwtService.sign(jwtAccessTokenPayload, {
      expiresIn: ConfigService.get('jwt.accessTokenExpiration'),
    });

    const jwtRefreshTokenPayload = this.populateJwtRefreshTokenPayloadFromUser(
      clientId,
      user,
    );
    const refreshToken = this.jwtService.sign(jwtRefreshTokenPayload, {
      expiresIn: ConfigService.get('jwt.refreshTokenExpiration'),
    });

    const result = new AuthLoginResultMetadata();
    // TODO: Mapping response data
    result.userId = user.user_id;
    result.accessToken = accessToken;
    result.refreshToken = refreshToken;
    result.email = user.email;
    // result.username = user.username;
    // result.displayName = user.displayName;

    Logger.log('### RESULT =============================================');
    Logger.log(result);

    return result;
  }

  public populateJwtAccessTokenPayloadFromUser(clientId: string, user: any) {
    const jwtPayload: Partial<JwtAccessTokenPayload> = {
      clientId,
    };

    return jwtPayload;
  }

  public populateJwtRefreshTokenPayloadFromUser(clientId: string, user: any) {
    const jwtPayload: Partial<JwtRefreshTokenPayload> = {
      clientId,
    };

    return jwtPayload;
  }

  public static get isLoggedIn() {
    return !!this.getAuthMetadata();
  }

  /**
   * Set REQUEST_CONTEXT.AUTH_METADATA value (this is request context assigned by AuthMiddleware)
   */
  public static setAuthMetadata(authMetadata: AuthLoginMetadata) {
    RequestContextMetadataService.setMetadata('AUTH_METADATA', authMetadata);
  }

  /**
   * Retrieve REQUEST_CONTEXT.AUTH_METADATA value (this is request context assigned by AuthMiddleware)
   */
  public static getAuthMetadata(): AuthLoginMetadata {
    return RequestContextMetadataService.getMetadata('AUTH_METADATA');
  }

  /**
   * Retrieve roles from REQUEST_CONTEXT.AUTH_METADATA (this is request context assigned by AuthMiddleware)
   */
  public static getAuthMetadataRoles(): string[] {
    const { roles } = this.getAuthMetadata();
    return roles || [];
  }
}
