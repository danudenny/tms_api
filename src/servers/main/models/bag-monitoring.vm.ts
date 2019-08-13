import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BagMonitoringVm {
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
  totalScanIn: number;

  @ApiModelProperty()
  totalScanOut: number;

  @ApiModelProperty()
  fullname: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  totalAwb: number;
}
