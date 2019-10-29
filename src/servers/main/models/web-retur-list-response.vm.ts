import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ItemReturResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  originAwbId: string;

  @ApiModelProperty()
  via: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  customer: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  notes: string;
}

export class WebReturListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ItemReturResponseVm] })
  data: ItemReturResponseVm[];
}
