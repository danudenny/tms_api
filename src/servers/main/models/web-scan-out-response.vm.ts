import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// Scan Out Awb List
export class WebScanInResponseVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty()
  doPodDateTime: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  percenScanInOut: number;

  @ApiModelProperty()
  lastDateScanIn: string;

  @ApiModelProperty()
  lastDateScanOut: string;

  @ApiModelProperty()
  fullname: string;
}

export class WebScanOutAwbListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInResponseVm] })
  data: WebScanInResponseVm[];
}

// Create DO POD
export class WebScanOutCreateResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  doPodId: number;
}

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

export class WebScanOutAwbResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}

// Scan Out Bag
// Scan Out Awb
export class ScanBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanOutBagResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanBagVm] })
  data: ScanBagVm[];
}
