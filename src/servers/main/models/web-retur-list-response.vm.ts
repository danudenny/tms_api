import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ItemReturResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  originAwbNumber: string;

  @ApiModelProperty()
  returnAwbNumber: string;

  @ApiModelProperty()
  via: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  PartnerLogisticName: string;

  @ApiModelProperty()
  isParterLogistic: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  notes: string;
}

export class WebReturListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ItemReturResponseVm] })
  data: ItemReturResponseVm[];
}
