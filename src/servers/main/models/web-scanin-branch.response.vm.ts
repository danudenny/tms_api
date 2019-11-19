import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class ScanBranchVm {
  @ApiModelProperty()
  reperesentativeTo: number;

  @ApiModelProperty()
  podFilterId: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  totalAwbScan: number;

  @ApiModelProperty()
  totalAwbItem: number;

  @ApiModelProperty()
  totalBagScan: number;

}

export class ScanBranchNewVm {
  @ApiModelProperty()
  reperesentativeTo: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class VerificationAwbVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanInBranchResponseVm  {
  @ApiModelProperty({ type: [ScanBranchVm] })
  data: ScanBranchVm[];
}

export class WebScanInBranchResponseNewVm  {
  @ApiModelProperty({ type: [ScanBranchNewVm] })
  data: ScanBranchNewVm[];
}

export class VerificationAwbResponseVm  {
  @ApiModelProperty({ type: [VerificationAwbVm] })
  data: VerificationAwbVm[];
}
