import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ReturHistoryVm {
  @ApiModelProperty()
  doPodDateTime: string;

  @ApiModelProperty()
  doPodId: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  branchIdTo: number;

  @ApiModelProperty()
  branchNameTo: string;

  @ApiModelProperty()
  driverName: string;
}

export class WebReturHistoryFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ReturHistoryVm] })
  data: ReturHistoryVm[];
}
