import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// Scan Out Awb List
export class ItemDeliveryResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  representativeIdTo: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  awbStatusTitle: string;
}

export class WebDeliveryListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ItemDeliveryResponseVm] })
  data: ItemDeliveryResponseVm[];
}
