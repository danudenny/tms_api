import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MappingRoleUserPayloadVm {
  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  branchIdLast: number;

  @ApiModelProperty()
  branchIdNew: number;

  @ApiModelProperty()
  userIdUpdated: number;

}
