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
export class MonitoringBagHubResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({type: () => [MonitoringBagHubDataResponseVm]})
  data: MonitoringBagHubDataResponseVm[];
}
