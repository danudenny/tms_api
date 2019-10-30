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
  branchName: string;

  @ApiModelProperty()
  partnerLogisticName: string;

  @ApiModelProperty()
  isPartnerLogistic: boolean;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  notes: string;

  @ApiModelProperty()
  refCustomerAccountId: string;

  @ApiModelProperty()
  customerName: string;
}

export class WebReturListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ItemReturResponseVm] })
  data: ItemReturResponseVm[];
}
