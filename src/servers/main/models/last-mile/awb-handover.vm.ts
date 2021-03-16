import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class AwbHandoverListDataResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  partnerId: string;

  @ApiModelProperty()
  shipperName: string;

  @ApiModelProperty()
  recipientName: boolean;

  @ApiModelProperty()
  awbDeliverDate: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  nik: string;
}

export class AwbHandoverListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbHandoverListDataResponseVm] })
  data: AwbHandoverListDataResponseVm[];
}
