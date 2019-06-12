import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebScanInResponseVm {
  @ApiModelProperty()
  podScaninDateTime: string;

  @ApiModelProperty()
  awbId: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  employeId: string;

}
