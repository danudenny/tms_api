import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class MonitoringHubProblemDataVm {

  @ApiModelProperty()
  scanDate: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  do: string;

  @ApiModelProperty()
  in: string;

  @ApiModelProperty()
  out: string;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  scanDateInHub: string;
}

export class MonitoringHubProblemVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MonitoringHubProblemDataVm] })
  data: MonitoringHubProblemDataVm[];
}

export class MonitoringHubTotalProblemDataVm {

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  scanDate: string;

  @ApiModelProperty()
  problem: string;

  @ApiModelProperty()
  doHub: string;

  @ApiModelProperty()
  manualSortir: string;

  @ApiModelProperty()
  machineSortir: string;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  cityName: string;

  @ApiModelProperty()
  scanOut: string;

  @ApiModelProperty()
  notScanOut: string;
}

export class MonitoringHubTotalProblemVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MonitoringHubTotalProblemDataVm] })
  data: MonitoringHubTotalProblemDataVm[];
}
