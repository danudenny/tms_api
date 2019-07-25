import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RoleVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  roleName: string;
}
