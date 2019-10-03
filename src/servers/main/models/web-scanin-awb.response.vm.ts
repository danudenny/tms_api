import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ScanInputNumberBranchVm } from './web-scanin.vm';

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

export class WebScanInAwbResponseVm  {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}

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

export class WebScanInBagResponseVm  {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanBagVm] })
  data: ScanBagVm[];
}

export class ResponseBagBranchVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class ValidateVm {
  @ApiModelProperty()
  totalBagItem: string;

  @ApiModelProperty()
  podFilterDetail: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanInValidateBagResponseVm  {
  @ApiModelProperty({ type: [ValidateVm] })
  data: ValidateVm[];
}
