import { HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenExpiredError } from 'jsonwebtoken';
import { map, toInteger } from 'lodash';
import ms = require('ms');

import { PermissionAccessResponseVM } from '../../servers/auth/models/auth.vm';
import {
  JwtAccessTokenPayload,
  JwtPermissionTokenPayload,
  JwtRefreshTokenPayload,
} from '../interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../models/auth-login-metadata.model';
import { AuthLoginResultMetadata } from '../models/auth-login-result-metadata';
import { GetRoleResult } from '../models/get-role-result';
import { Branch } from '../orm-entity/branch';
import { User } from '../orm-entity/user';
import { UserRole } from '../orm-entity/user-role';
import { UserRepository } from '../orm-repository/user.repository';
import { ConfigService } from './config.service';
import { ContextualErrorService } from './contextual-error.service';
import { RedisService } from './redis.service';
import { RepositoryService } from './repository.service';
import { RequestContextMetadataService } from './request-context-metadata.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

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
        ContextualErrorService.throwObj({
          message: 'global.error.LOGIN_WRONG_PASSWORD',
        });
      }
    } else {
      ContextualErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<AuthLoginResultMetadata> {
    // TODO: find user on table or redis??
    const loginSession = await RedisService.get(`session:${refreshToken}`);
    Logger.log(loginSession);
    if (!loginSession) {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.LOGIN_SESSION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let refreshTokenPayload: JwtRefreshTokenPayload;
    try {
      refreshTokenPayload = this.jwtService.verify(refreshToken);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        ContextualErrorService.throwObj(
          {
            message: 'global.error.REFRESH_TOKEN_EXPIRED',
          },
          HttpStatus.FORBIDDEN,
        );
      } else {
        ContextualErrorService.throwObj(
          {
            message: 'global.error.REFRESH_TOKEN_NOT_VALID',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // TODO: Populate AuthLoginResultMetadata and assign accessToken to the newly generated access token
    const newLoginMetadata = this.populateLoginResultMetadataByUser(
      refreshTokenPayload.clientId,
      JSON.parse(loginSession),
    );
    if (newLoginMetadata) {
      // remove data on redis with refresh token
      await RedisService.del(`session:${refreshToken}`);
    }
    return newLoginMetadata;
  }

  async removeToken(refreshToken: string) {
    if (refreshToken) {
      // remove data on redis with refresh token
      await RedisService.del(`session:${refreshToken}`);
    }
    return { status: 200, message: 'ok' };
  }

  async permissionRoles(): Promise<GetRoleResult> {
    const authMeta = AuthService.getAuthMetadata();
    // const user = await this.userRepository.findByUserIdWithRoles());
    // check user present
    if (!!authMeta) {
      const roles = await UserRole.find({
        cache: true,
        relations: ['branch', 'role'],
        where: {
          user_id: toInteger(authMeta.userId),
        },
      });

      // Populate return value
      const result = new GetRoleResult();
      result.userId = authMeta.userId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;
      // result.roles = map(roles, role => pick(role, ['role_id', 'role.role_name', 'branch_id', 'branch.branch_name']));
      result.roles = map(roles, item => {
        const newObj = {
          roleId: item.role_id,
          roleName: item.role.roleName,
          branchId: item.branch_id,
          branchName: item.branch.branchName,
          branchCode: item.branch.branchCode,
        };
        return newObj;
      });

      return result;
    } else {
      ContextualErrorService.throwObj(
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
    if (authMeta) {
      const user = await RepositoryService.user
        .loadById(authMeta.userId)
        .innerJoinAndSelect(e => e.userRoles.role.rolePermissions)
        .andWhere(e => e.userRoles.role_id, w => w.equals(roleId))
        .andWhere(e => e.userRoles.branch_id, w => w.equals(branchId))
        .exec();

      if (!user) {
        ContextualErrorService.throwObj(
          {
            message: `Hak akses user untuk role dan branch ini tidak ditemukan`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const branch = await Branch.findOne({
        cache: true,
        where: {
          branchId,
        },
      });

      // create Permission Token
      const jwtPermissionTokenPayload = this.populateJwtPermissionTokenPayloadFromUser(
        roleId,
        branchId,
      );
      const permissionToken = this.jwtService.sign(
        jwtPermissionTokenPayload,
        {},
      );

      // Populate return value
      const result = new PermissionAccessResponseVM();
      result.userId = authMeta.userId;
      result.clientId = authMeta.clientId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;
      result.permissionToken = permissionToken;
      result.roleName = user.userRoles[0].role.roleName;

      result.branchName = branch.branchName;
      result.branchCode = branch.branchCode;

      // FIXME: populate rolesAccessPermissions from user.userRoles[0].role.role_permissions
      result.rolesAccessPermissions = [
        'dashboard',
        'pod',
        'pod_scan_in_branch',
        'pod_scan_in_hub',
        'do_pod',
        'do_pod_hub',
        'pod_sortir_hub',
        'pod_input_awb_3pl',
        'pod_manual',
        'scan_in_list',
        'scan_in_list_hub',
        'do_pod_list',
        'pod_awb_list',
        'awb_3pl_list',
        'pod_scan_in_problem',
        'pod_scan_in_problem_ct',
        'pod_scan_in_problem_branch',
        'pod_scan_in_problem_hub',
        'pod_awb_problem',
        'do_pod_bag_list',
        'do_pod_deliver_list',
        'pod_filter_list',
      ];

      return result;
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // handle permission Token
  async handlePermissionJwtToken(
    jwtToken: string = AuthService.getPermissionToken(),
  ) {
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
  public async populateLoginResultMetadataByUser(clientId: string, user: User) {
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

    // NOTE: set data user on redis
    // Set key to hold the string value and set key to timeout after a given number of seconds
    const expireInSeconds = Math.floor(
      ms(ConfigService.get('jwt.refreshTokenExpiration')) / 1000,
    );
    await RedisService.setex(
      `session:${refreshToken}`,
      JSON.stringify(user),
      expireInSeconds,
    );

    const result = new AuthLoginResultMetadata();
    // Mapping response data
    result.userId = user.userId;
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
      userId: user.userId,
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
      userId: user.userId,
    };

    return jwtPayload;
  }

  // Set data payload JWT Permission Token
  public populateJwtPermissionTokenPayloadFromUser(
    roleId: number,
    branchId: number,
  ) {
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

  public static getAuthData(): AuthLoginMetadata {
    const authMeta = RequestContextMetadataService.getMetadata('AUTH_METADATA');
    if (!!authMeta) {
      return authMeta;
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public static getPermissionToken() {
    return RequestContextMetadataService.getMetadata('PERMISSION_TOKEN');
  }

  public static setPermissionTokenPayload(
    permissionTokenPayload: JwtPermissionTokenPayload,
  ) {
    RequestContextMetadataService.setMetadata(
      'PERMISSION_TOKEN_PAYLOAD',
      permissionTokenPayload,
    );
  }

  public static getPermissionTokenPayload() {
    return RequestContextMetadataService.getMetadata<JwtPermissionTokenPayload>(
      'PERMISSION_TOKEN_PAYLOAD',
    );
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
