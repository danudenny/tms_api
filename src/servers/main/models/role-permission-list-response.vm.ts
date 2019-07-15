import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RolePermissionListResponseVm {
  @ApiModelProperty()
  rolesAccessPermissions: string[];
}
