import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { BagMonitoringVm } from './bag-monitoring.vm';

export class BagMonitoringResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [BagMonitoringVm] })
  data: BagMonitoringVm[];
}
