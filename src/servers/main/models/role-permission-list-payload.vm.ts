import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class RolePermissionListPayloadVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelPropertyOptional({ default: 'POD' })
  appName: string;
}
