import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { RoleVm } from './role.vm';

// #region Request Section
export class AuthLoginByEmailOrUsernamePayloadVM {
  @ApiModelProperty()
  clientId: string;

  @ApiModelPropertyOptional()
  @IsEmail({})
  @IsOptional({})
  email?: string;

  @ApiModelPropertyOptional()
  username: string;

  @ApiModelProperty()
  @IsNotEmpty()
  password: string;
}

export class PermissionAccessPayloadVM {
  @ApiModelProperty()
  clientId: string;

  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  branchId: number;
}
export class PermissionRolesPayloadVM {
  @ApiModelProperty()
  clientId: string;

  // @ApiModelProperty()
  // roleId: number;
}

//#endregion

// #region Response section
export class AuthLoginResponseVM {
  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  accessToken: string;

  @ApiModelProperty()
  refreshToken: string;

  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  displayName: string;
}

export class AuthLoginWithRolesResponseVM {
  @ApiModelProperty()
  userId: string;

  @ApiModelProperty()
  accessToken: string;

  @ApiModelProperty()
  refreshToken: string;

  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty({ type: [RoleVm] })
  roles: RoleVm[];
}

export class PermissionRolesResponseVM {
  @ApiModelProperty()
  userId: string;

  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty({ type: [RoleVm] })
  roles: RoleVm[];
}

export class PermissionAccessResponseVM {
  @ApiModelProperty()
  clientId: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  isHeadOffice: boolean;

  @ApiModelProperty()
  roleName: string;

  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty()
  rolesAccessPermissions: string[];

  @ApiModelProperty()
  isKorwil: boolean;

  @ApiModelProperty()
  isPalkur: boolean;

  @ApiModelProperty()
  isSmd: boolean;
}

// #endregion
