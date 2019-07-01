import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class RoleVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  roleCode: string;

  @ApiModelProperty()
  roleName: string;
}

export class RoleSearchVm {
  @ApiModelProperty()
  search: string;

}

export class RolePayloadVm {
  @ApiModelPropertyOptional({ type: () => RoleSearchVm })
  filters?: RoleSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'role_name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}

// response
export class RoleFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [RoleVm] })
  data: RoleVm[];
}
