import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { RoleVm } from './role.vm';

// #region Request Section
export class AuthLoginByEmailOrUsernamePayloadVM {
  @ApiModelProperty()
  clientId: string;

  @ApiModelPropertyOptional()
  email: string;

  @ApiModelPropertyOptional()
  username: string;

  @ApiModelProperty()
  password: string;
}

export class PermissionRolesPayloadVM {
  @ApiModelProperty()
  clientId: string;
}
//#endregion

// #region Response section
export class AuthLoginResponseVM {
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
// #endregion
