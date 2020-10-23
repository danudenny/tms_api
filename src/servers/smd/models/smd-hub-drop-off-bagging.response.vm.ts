import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class SmdHubDropOffGabPaketListDataResponseVm {
  @ApiModelProperty()
  baggingId: number;

  @ApiModelProperty()
  baggingItemId: number;

  @ApiModelProperty()
  bagNumber: string;
}

export class SmdHubDropOffGabPaketListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmdHubDropOffGabPaketListDataResponseVm] })
  data: SmdHubDropOffGabPaketListDataResponseVm[];
}

export class SmdHubDropOffGabPaketAwbListDataResponseVm {
  @ApiModelProperty()
  baggingItemId: number;

  @ApiModelProperty()
  bagItemAwbId: number;

  @ApiModelProperty()
  awbNumber: string;
}

export class SmdHubDropOffGabPaketAwbListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmdHubDropOffGabPaketAwbListDataResponseVm] })
  data: SmdHubDropOffGabPaketAwbListDataResponseVm[];
}
