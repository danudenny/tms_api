import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// Scan Out Awb List
export class ItemDeliveryResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  representativeIdTo: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  awbStatusTitle: string;

  @ApiModelProperty()
  isCod: string;

  @ApiModelProperty()
  isDoReturn: string;

  @ApiModelProperty()
  doReturnNumber: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  awbStatusIdLast: number;

  @ApiModelProperty()
  note: string;

  // @ApiModelProperty()
  // url: string;
}

export class WebDeliveryListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ItemDeliveryResponseVm] })
  data: ItemDeliveryResponseVm[];
}
