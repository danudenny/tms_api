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
  remaining: number;

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

export class MonitoringBagHubResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({type: () => MonitoringBagHubTotalBagResponseVm})
  totalDetail: MonitoringBagHubTotalBagResponseVm;

  @ApiModelProperty({type: () => [MonitoringBagHubDataResponseVm]})
  data: MonitoringBagHubDataResponseVm[];
}
