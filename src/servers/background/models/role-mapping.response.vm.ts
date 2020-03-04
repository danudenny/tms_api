import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class RoleMappingVm {
  @ApiModelProperty()
  roleMappingd: number;

  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  roleIdTms: number;
}

export class RoleMappingResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [RoleMappingVm] })
  data: RoleMappingVm[];

}
