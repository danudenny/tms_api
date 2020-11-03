import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import {BaseMetaResponseVm} from '../../../shared/models/base-meta-response.vm';

export class MonitoringBagHubDataResponseVm {
  @ApiModelProperty()
  origin: number;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  totalScanIn: number;

  @ApiModelProperty()
  totalScanOut: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  remaining: number;

  @ApiModelProperty()
  doPodDateTime: number;

  @ApiModelProperty()
  status: number;
}

export class MonitoringBagHubTotalBagResponseVm {
  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  totalHub: number;

  @ApiModelProperty()
  totalUnload: number;

  @ApiModelProperty()
  totalDelivery: number;

  @ApiModelProperty()
  totalDoBag: number;

  @ApiModelProperty()
  totalDoHub: number;

  @ApiModelProperty()
  totalDoUnload: number;

  @ApiModelProperty()
  totalDoDelivery: number;
}

export class MonitoringSortirHubDataResponseVm {
  @ApiModelProperty()
  createdTime: number;

  @ApiModelProperty()
  doPodCode: number;

  @ApiModelProperty()
  branchTo: number;

  @ApiModelProperty()
  status: number;

  @ApiModelProperty()
  totalBagSortir: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalScanInAwb: number;

  @ApiModelProperty()
  remainingAwbSortir: number;

  @ApiModelProperty()
  totalScanOutBagSortir: number;
}

export class MonitoringSortirHubTotalBagResponseVm {
  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  totalScanOutBagSortir: number;

  @ApiModelProperty()
  totalBagSortir: number;

  @ApiModelProperty()
  totalSort: number;
}

export class MonitoringBagHubResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({type: () => MonitoringBagHubTotalBagResponseVm})
  totalDetail: MonitoringBagHubTotalBagResponseVm;

  @ApiModelProperty({type: () => [MonitoringBagHubDataResponseVm]})
  data: MonitoringBagHubDataResponseVm[];
}

export class MonitoringSortirHubResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({type: () => MonitoringSortirHubTotalBagResponseVm})
  totalDetail: MonitoringSortirHubTotalBagResponseVm;

  @ApiModelProperty({type: () => [MonitoringSortirHubDataResponseVm]})
  data: MonitoringSortirHubDataResponseVm[];
}
