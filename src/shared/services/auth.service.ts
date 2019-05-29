import { HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

import { JwtAccessTokenPayload, JwtRefreshTokenPayload, JwtPermissionTokenPayload } from '../interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../models/auth-login-metadata.model';
import { AuthLoginResultMetadata } from '../models/auth-login-result-metadata';
import { ConfigService } from './config.service';
import { ContextualErrorService } from './contextual-error.service';
import { RequestContextMetadataService } from './request-context-metadata.service';
import { User } from '../orm-entity/user';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../orm-repository/user.repository';
import { map, pick, toInteger } from 'lodash';
import { GetRoleResult } from '../models/get-role-result';
import { UserRole } from '../orm-entity/user-role';
import { GetAccessResult } from '../models/get-access-result';
import { RolePermission } from '../orm-entity/role-permission';
import { Branch } from '../orm-entity/branch';
import { PermissionAccessResponseVM } from '../../servers/auth/models/auth.vm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    // @InjectRepository(LoginSessionRepository)
    // private readonly loginSessionRepository: LoginSessionRepository,
  ) { }

  async login(
    clientId: string,
    username: string,
    password: string,
    email?: string,
  ): Promise<AuthLoginResultMetadata> {

    // find by email or username on table users
    const user = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );

    // check user present
    if (user) {
      // Logger.log(user);
      // validate user password hash md5
      if (user.validatePassword(password)) {
        // TODO: Populate return value by using this.populateLoginResultMetadataByUser
        const loginResultMetadata = this.populateLoginResultMetadataByUser(
          clientId,
          user,
          );
        return loginResultMetadata;
      } else {
        ContextualErrorService.throw({
            message: 'global.error.LOGIN_WRONG_PASSWORD',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
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

  async permissionRoles(): Promise<GetRoleResult> {
    const authMeta = AuthService.getAuthMetadata();
    // const user = await this.userRepository.findByUserIdWithRoles());
    // check user present
    if (!!authMeta) {
      const roles = await UserRole.find(
        {
          cache: true,
          relations: ['branch', 'role'],
          where: {
            user_id: toInteger(authMeta.userId),
          },
        },
      );

      // Populate return value
      const result = new GetRoleResult();
      result.userId = authMeta.userId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;
      // result.roles = map(roles, role => pick(role, ['role_id', 'role.role_name', 'branch_id', 'branch.branch_name']));
      result.roles = map(roles,
          item => {
            const newObj = {
              roleId: item.role_id,
              roleName: item.role.role_name,
              branchId: item.branch_id,
              branchName: item.branch.branchName,
              branchCode: item.branch.branchCode,
            };
            return newObj;
          },
        );

      // Logger.log('############## Result permissionRoles ==================================================');
      // Logger.log(result);

      return result;
    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async permissionAccess(
    clientId: string,
    roleId: number,
    branchId: number,
  ): Promise<PermissionAccessResponseVM> {
    const authMeta = AuthService.getAuthMetadata();
    // const user = await this.userRepository.findByUserIdWithRoles());
    // check user present
    if (!!authMeta) {
      const rolesAccess = await RolePermission.find(
        {
          cache: true,
          where: {
            role_id: roleId,
          },
        },
      );

      const branch = await Branch.findOne({
        cache: true,
        where: {
          branch_id: branchId,
        },
      });
      // create Permission Token
      const jwtPermissionTokenPayload = this.populateJwtPermissionTokenPayloadFromUser(
        roleId,
        branchId,
      );
      const permissionToken = this.jwtService.sign(jwtPermissionTokenPayload, {});

      // Populate return value
      const result = new PermissionAccessResponseVM();
      result.clientId = authMeta.clientId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;
      result.permissionToken = permissionToken;

      result.branchName = branch.branchName;
      result.branchCode = branch.branchCode;
      result.rolesAccessPermissions = map(rolesAccess, 'name');

      return result;
    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // handle permission Token
  async handlePermissionJwtToken(jwtToken: string) {
    let jwt: { payload: JwtPermissionTokenPayload };
    try {
      this.validateJwtTokenPermission(jwtToken);
      jwt = this.jwtService.decode(jwtToken, {
        complete: true,
      }) as { payload: JwtPermissionTokenPayload };
    } catch (error) {
      throw new UnauthorizedException();
    }
    // return data payload token permission
    return jwt.payload;
  }

  // method populate data user login
  public populateLoginResultMetadataByUser(
    clientId: string,
    user: User,
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
    // Mapping response data
    result.userId = user.user_id;
    result.accessToken = accessToken;
    result.refreshToken = refreshToken;
    result.email = user.email;
    result.username = user.username;
    result.displayName = user.employee ? user.employee.employeeName : '';
    result.employeeId = user.employee ? user.employee.employeeId : null;
    // result.roles = map(user.roles, role => pick(role, ['role_id', 'role_name']));

    return result;
  }

  // Set data payload JWT Access Token
  public populateJwtAccessTokenPayloadFromUser(clientId: string, user: User) {
    const jwtPayload: Partial<JwtAccessTokenPayload> = {
      clientId,
      userId: user.user_id,
      username: user.username,
      email: user.email,
      displayName: user.employee ? user.employee.employeeName : '',
      employeeId: user.employee ? user.employee.employeeId : null,
    };

    return jwtPayload;
  }

  // Set data payload JWT Refresh Token
  public populateJwtRefreshTokenPayloadFromUser(clientId: string, user: User) {
    const jwtPayload: Partial<JwtRefreshTokenPayload> = {
      clientId,
      userId: user.user_id,
    };

    return jwtPayload;
  }

  // Set data payload JWT Permission Token
  public populateJwtPermissionTokenPayloadFromUser(roleId: number, branchId: number) {
    const jwtPayload: Partial<JwtPermissionTokenPayload> = {
      roleId,
      branchId,
    };

    return jwtPayload;
  }

  // validate user is logged in if get data auth metadata
  // return boolean (true | false)
  public static get isLoggedIn() {
    return !!this.getAuthMetadata();
  }

  // #region REQUEST_CONTEXT
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
  public static getAuthMetadataRoles(): object[] {
    const { roles } = this.getAuthMetadata();
    return roles || [];
  }
  // #endregion

  private validateJwtTokenPermission(token: string): boolean {
    try {
      const validToken = this.jwtService.verify(token);
      return Boolean(validToken);
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
