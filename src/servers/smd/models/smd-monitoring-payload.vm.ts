import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import {BaseMetaPayloadVm} from '../../../shared/models/base-meta-payload.vm';

export class MonitoringPayloadVm extends BaseMetaPayloadVm {
  @ApiModelPropertyOptional()
  user_id: string;

  @ApiModelPropertyOptional()
  baranch_id: string;

  @ApiModelProperty()
  id: string;
}

export class StoreExcelMonitoringPayloadVm {
  @ApiModelProperty({ type: () => MonitoringPayloadVm })
  data: MonitoringPayloadVm = new MonitoringPayloadVm();
}
