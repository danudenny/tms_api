import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobileDeliveryHistoryVm } from './mobile-delivery-history.vm';

export class MobileDeliveryVm {
  @ApiModelProperty()
  doPodDeliverDetailId: number;

  @ApiModelProperty()
  doPodDeliverId: number;

  @ApiModelProperty({ format: 'date-time' })
  doPodDateTime: string;

  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty({ format: 'date-time' })
  awbDate: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  merchant: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeNote: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  packageTypeName: string;

  @ApiModelProperty()
  productType: string;

  @ApiModelProperty()
  isCOD: boolean;

  @ApiModelProperty({ type: [MobileDeliveryHistoryVm] })
  deliveryHistory: MobileDeliveryHistoryVm[];
}
