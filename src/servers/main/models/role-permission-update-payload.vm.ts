import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RolePermissionUpdatePayloadVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  rolesAccessPermissions: string[];
}
