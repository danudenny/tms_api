import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { DoReturnResponseVm, DoReturnAdminResponseVm } from './do-return.vm';
export class ReturnFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnResponseVm] })
  data: DoReturnResponseVm[];
}
export class DoReturnAdminFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnAdminResponseVm] })
  data: DoReturnAdminResponseVm[];
}
