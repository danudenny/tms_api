import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
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
  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm;
}

export class CreateDoPodResponseVm {
  @ApiModelProperty()
  doPodId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}