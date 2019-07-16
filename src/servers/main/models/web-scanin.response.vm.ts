import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebScanInResponseVm {
  @ApiModelProperty()
  podScanInDateTime: string;

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
