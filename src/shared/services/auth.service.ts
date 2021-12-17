import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenExpiredError } from 'jsonwebtoken';
import { map } from 'lodash';
import ms = require('ms');

import { PermissionAccessResponseVM } from '../../servers/auth/models/auth.vm';
import {
  JwtAccessTokenPayload,
  JwtPermissionTokenPayload,
  JwtRefreshTokenPayload,
} from '../interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../models/auth-login-metadata.model';
import { AuthLoginResultMetadata } from '../models/auth-login-result-metadata';
import { GetRoleResult, UserRoleResponse } from '../models/get-role-result';
import { Branch } from '../orm-entity/branch';
import { User } from '../orm-entity/user';
import { UserRepository } from '../orm-repository/user.repository';
import { ConfigService } from './config.service';
import { RequestErrorService } from './request-error.service';
import { RedisService } from './redis.service';
import { RepositoryService } from './repository.service';
import { RequestContextMetadataService } from './request-context-metadata.service';
import { PartnerTokenPayload } from '../interfaces/partner-payload.interface';
import { createQueryBuilder } from 'typeorm';
import { Employee } from '../orm-entity/employee';


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
      // PinoLoggerService.log(user);
      // validate user password hash md5
      if (user.validatePassword(password)) {
        const loginResultMetadata = this.populateLoginResultMetadataByUser(
          clientId,
          user,
        );
        return loginResultMetadata;
      } else {
        RequestErrorService.throwObj({
          message: 'global.error.LOGIN_WRONG_PASSWORD',
        });
      }
    } else {
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<AuthLoginResultMetadata> {
    // TODO: find user on table or redis??
    const loginSession = await RedisService.get(`session:${refreshToken}`);

    if (!loginSession) {
      RequestErrorService.throwObj(
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
        RequestErrorService.throwObj(
          {
            message: 'global.error.REFRESH_TOKEN_EXPIRED',
          },
          HttpStatus.FORBIDDEN,
        );
      } else {
        RequestErrorService.throwObj(
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
      // const roles = await UserRole.find({
      //   // cache: true,
      //   relations: ['branch', 'role'],
      //   where: {
      //     userId: toInteger(authMeta.userId),
      //     isDeleted: false,
      //   },
      // });
      const roles = await this.getUserRole(authMeta.userId);

      // Populate return value
      const result = new GetRoleResult();
      result.userId = authMeta.userId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;
      result.roles = roles;
      // result.roles = map(roles, role => pick(role, ['role_id', 'role.role_name', 'branch_id', 'branch.branch_name']));
      // result.roles = map(roles, item => {
      //   const newObj = {
      //     roleId: item.roleId,
      //     roleName: item.role.roleName,
      //     branchId: item.branchId,
      //     branchName: item.branch.branchName,
      //     branchCode: item.branch.branchCode,
      //     isHeadOffice: item.branch.isHeadOffice,
      //   };
      //   return newObj;
      // });

      return result;
    } else {
      RequestErrorService.throwObj(
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
    const configKorwil = ConfigService.get('korwil');
    const configRetur = ConfigService.get('retur');

    if (authMeta) {
      const user = await RepositoryService.user
        .loadById(authMeta.userId)
        .innerJoinAndSelect(e => e.userRoles.role.rolePermissions)
        .andWhere(e => e.userRoles.roleId, w => w.equals(roleId))
        .andWhere(e => e.userRoles.branchId, w => w.equals(branchId))
        .exec();

      if (!user) {
        RequestErrorService.throwObj(
          {
            message: `Hak akses user untuk role dan branch ini tidak ditemukan`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const branch = await Branch.findOne({
        // cache: true,
        where: {
          branchId,
          isDeleted : false,
          isActive : true,
        },
      });

      // create Permission Token
      const roleName = user.userRoles[0].role.roleName;
      const isHeadOffice = branch ? branch.isHeadOffice : false;
      const jwtPermissionTokenPayload = this.populateJwtPermissionTokenPayloadFromUser(
        roleId,
        roleName,
        branchId,
        isHeadOffice,
      );
      const permissionToken = this.jwtService.sign(
        jwtPermissionTokenPayload,
        {},
      );

      const result = new PermissionAccessResponseVM();
      result.isKorwil = false;
      result.isPalkur = false;
      result.isSmd = false;
      result.isSigesitReturn = false;

      // Role Id Korwil (38, 155), role Id palkur (40, 41), korwil HRD 154
      if (configKorwil.korwilRoleId.includes(Number(roleId)) || roleId == configKorwil.korwilHrdRoleId) {
        result.isKorwil = true;
      } else if (configKorwil.palkurRoleId.includes(Number(roleId))) {
        result.isPalkur = true;
      }
      if (roleId == configKorwil.smdRoleId) {
        result.isSmd = true;
      }

      if (configRetur.returnRoleId.includes(Number(roleId))) {
        result.isSigesitReturn = true;
      }
      // Populate return value
      result.userId = authMeta.userId;
      result.clientId = authMeta.clientId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;
      result.permissionToken = permissionToken;
      result.roleName = roleName;
      if (branch) {
        result.branchName = branch.branchName;
        result.branchCode = branch.branchCode;
        result.isHeadOffice = branch.isHeadOffice;
      }
      // FIXME: populate rolesAccessPermissions from user.userRoles[0].role.role_permissions
      result.rolesAccessPermissions = map(
        user.userRoles[0].role.rolePermissions,
        item => item.name,
      );
      return result;
    } else {
      RequestErrorService.throwObj(
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
    // get data employee if employee id not null
    // 10 active, 20 inactive
    const employee = await Employee.findOne({
      select: ['employeeId', 'employeeName', 'statusEmployee'],
      where: {
        employeeId: user.employeeId,
        isDeleted: false,
      },
    });

    // handle validation status employee
    if (employee && employee.statusEmployee == 20) {
      RequestErrorService.throwObj({
        message: 'global.error.USER_NOT_FOUND',
      });
    }

    const employeeName = employee ? employee.employeeName : '';
    const jwtAccessTokenPayload = this.populateJwtAccessTokenPayloadFromUser(
      clientId,
      user,
      employeeName,
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

    await RedisService.setex(
      `session:v2:${refreshToken}`,
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
    result.employeeId = user.employeeId;
    result.displayName = employeeName;
    // result.roles = map(user.roles, role => pick(role, ['role_id', 'role_name']));

    return result;
  }

  // Set data payload JWT Access Token
  public populateJwtAccessTokenPayloadFromUser(
    clientId: string,
    user: User,
    employeeName: string,
  ) {
    const jwtPayload: Partial<JwtAccessTokenPayload> = {
      clientId,
      userId: user.userId,
      username: user.username,
      email: user.email,
      employeeId: user.employeeId,
      displayName: employeeName,
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
    roleName: string,
    branchId: number,
    isHeadOffice: boolean,
  ) {
    const jwtPayload: Partial<JwtPermissionTokenPayload> = {
      roleId,
      roleName,
      branchId,
      isHeadOffice,
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
      RequestErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public static getRequestIP() {
    return RequestContextMetadataService.getMetadata('REQUEST_IP');
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

  // get data partner payload
  public static getPartnerTokenPayload() {
    return RequestContextMetadataService.getMetadata<PartnerTokenPayload>(
      'PARTNER_TOKEN_PAYLOAD',
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

  private async getUserRole(userId: number): Promise<UserRoleResponse[]> {
    const qb = createQueryBuilder();
    qb.addSelect('t1.role_id', 'roleId');
    qb.addSelect('t1.branch_id', 'branchId');
    qb.addSelect('t2.role_name', 'roleName');
    qb.addSelect('t3.branch_name', 'branchName');
    qb.addSelect('t3.branch_code', 'branchCode');
    qb.addSelect('t3.is_head_office', 'isHeadOffice');
    qb.from('user_role', 't1');
    qb.innerJoin(
      'role',
      't2',
      't1.role_id = t2.role_id AND t2.is_deleted = false',
    );
    qb.innerJoin(
      'branch',
      't3',
      't1.branch_id = t3.branch_id AND t3.is_deleted = false',
    );
    qb.where('t1.user_id = :userId', { userId });
    qb.andWhere('t1.is_deleted = false');

    return await qb.getRawMany();
  }

  private static get headerReqOtp() {
    return {
      'Content-Type': 'application/json',
    };
  }
}

