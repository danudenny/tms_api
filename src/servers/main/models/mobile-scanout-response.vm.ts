import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { ItemDeliveryResponseVm } from './web-delivery-list-response.vm';

// Scan Out Awb
export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class MobileScanOutAwbResponseVm {
  @ApiModelProperty()
  service: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneePhone: string;

  @ApiModelProperty()
  totalCodValue: string;

  @ApiModelProperty()
  dateTime: string;

  @ApiModelProperty()
  doPodId: string;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm;
}

export class CreateDoPodResponseVm {
  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
