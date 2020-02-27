import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class RoleTmsVm {
  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  roleName: string;
}

export class RoleTmsResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [RoleTmsVm] })
  data: RoleTmsVm[];

}
