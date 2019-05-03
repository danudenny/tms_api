import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RoleVm {
  @ApiModelProperty()
  roleId: string;

  @ApiModelProperty()
  roleName: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchCode: string;
}
