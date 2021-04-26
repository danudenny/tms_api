import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ItemReturResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbReturnId: string;

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
  branchTo: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  partnerLogisticName: string;

  @ApiModelProperty()
  partnerLogisticAwb: string;

  @ApiModelProperty()
  isPartnerLogistic: boolean;

  @ApiModelProperty()
  awbStatus: string;

  @ApiModelProperty()
  branchIdManifest: string;

  @ApiModelProperty()
  branchManifest: string;

  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  branchFrom: string;

  @ApiModelProperty()
  branchFromId: string;

  @ApiModelProperty()
  consignerName: number;

}

export class WebReturListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ItemReturResponseVm] })
  data: ItemReturResponseVm[];
}
