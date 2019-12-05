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
  bagNumber: string;

  @ApiModelProperty()
  totalBagScan: string;

  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  totalAwbScan: string;

  @ApiModelProperty()
  weight: string;

}

export class WebScanInBranchBagResponseVm {
  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  totalAwbScan: string;

  @ApiModelProperty()
  weight: string;

}

export class WebScanInBranchAwbResponseVm {
  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  totalWeightFinal: string;

  @ApiModelProperty()
  totalCodValue: string;

  @ApiModelProperty()
  totalAwbScan: string;

}

export class WebScanInHubSortResponseVm {
  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  bagNumberCode: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  dropoffHubId: string;

  @ApiModelProperty()
  dropoffSortationId: string;

  @ApiModelProperty()
  bagSeq: string;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representativeCode: string;
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
  totalAwb: number;

  @ApiModelProperty()
  branchNameScan: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  scanInStatus: string;

}
