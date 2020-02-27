import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { Type } from 'class-transformer';

export class MappingRolePayloadVm {
  @ApiModelProperty()
  employeeRoleId: number;

  @ApiModelProperty()
  @Type(() => RoleIdVm)
  roleIds: RoleIdVm[];

  @ApiModelProperty()
  userIdUpdated: number;
}

export class RoleIdVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  roleIdTms: number;
}
