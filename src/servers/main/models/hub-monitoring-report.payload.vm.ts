import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class MonitoringHubExcelStorePayloadVm extends BaseMetaPayloadVm {
}

export class HubMonitoringExcelExecutePayloadVm {
  @ApiModelProperty()
  id: string;
}
