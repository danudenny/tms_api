import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// Scan Out Awb List
export class ItemDeliveryResponseVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty()
  doPodDateTime: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  desc: string;

  @ApiModelProperty()
  fullname: string;
}

export class WebDeliveryListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ItemDeliveryResponseVm] })
  data: ItemDeliveryResponseVm[];
}
