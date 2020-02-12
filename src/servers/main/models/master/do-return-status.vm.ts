import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class DoReturnStatusVm {
  @ApiModelProperty()
  doReturnMasterId: number;

  @ApiModelProperty()
  doReturnMasterCode: number;

  @ApiModelProperty()
  doReturnMasterDesc: string;
}

export class DoReturnStatusFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoReturnStatusVm] })
  data: DoReturnStatusVm[];
}
