import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { RoleVm } from '../models/role.vm';

export class RoleFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [RoleVm] })
  data: RoleVm[];
}
