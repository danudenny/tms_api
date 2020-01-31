import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { DoReturnResponseVm, DoReturnAdminResponseVm, DoReturnCtResponseVm, DoReturnCollectionResponseVm } from './do-return.vm';
export class ReturnFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnResponseVm] })
  data: DoReturnResponseVm[];
}
export class DoReturnAdminFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnAdminResponseVm] })
  data: DoReturnAdminResponseVm[];
}

export class DoReturnCtFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnCtResponseVm] })
  data: DoReturnCtResponseVm[];
}

export class DoReturnCollectionFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnCollectionResponseVm] })
  data: DoReturnCollectionResponseVm[];
}
