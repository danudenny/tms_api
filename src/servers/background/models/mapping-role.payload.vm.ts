import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MappingRolePayloadVm {
  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  roleId: [];

  @ApiModelProperty()
  roleIdTms: [];

  @ApiModelProperty()
  userIdUpdated: number;

}
