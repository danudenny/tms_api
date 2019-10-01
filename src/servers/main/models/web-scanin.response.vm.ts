import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebScanInResponseVm {
  @ApiModelProperty()
  podScaninDateTime: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  branchNameScan: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  scanInStatus: string;

}

export class WebScanInBranchResponseVm {
  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  refRepresentativeCode: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  totalAwbItem: string;

  @ApiModelProperty()
  totalAwbScan: string;

  @ApiModelProperty()
  totalDiff: string;

  @ApiModelProperty()
  weight: string;

}

export class WebScanInBagResponseVm {
  @ApiModelProperty()
  podScaninDateTime: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagSeq: string;

  @ApiModelProperty()
  bagNumberCode: string;

  @ApiModelProperty()
  totalAwb: string;

  @ApiModelProperty()
  branchNameScan: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  scanInStatus: string;

}
