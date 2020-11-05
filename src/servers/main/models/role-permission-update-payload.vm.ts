import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class RolePermissionUpdatePayloadVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelPropertyOptional({ default: 'POD' })
  appName: string;

  @ApiModelProperty()
  rolesAccessPermissions: string[];
}
