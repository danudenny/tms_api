import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RolePermissionUpdateResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
