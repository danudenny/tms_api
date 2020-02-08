import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebMonitoringCoordinatorTaskPayload {
  @ApiModelProperty()
  korwilTransactionId: number;
}

export class WebMonitoringCoordinatorPhotoPayload {
  @ApiModelProperty()
  korwilTransactionDetailId: number;
}
