import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebMonitoringCoordinatorTaskPayload {
  @ApiModelProperty()
  korwilTransactionId: string;
}
export class WebMonitoringCoordinatorDetailPayload {
  @ApiModelProperty()
  userId: string;
}

export class WebMonitoringCoordinatorPhotoPayload {
  @ApiModelProperty()
  korwilTransactionDetailId: string;
}

export class MonitoringCoordinatorExcelExecutePayloadVm {
  @ApiModelProperty()
  id: string;
}
