import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MappingRoleUserPayloadVm {
  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  userIdUpdated: number;

}
