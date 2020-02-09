import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebMonitoringCoordinatorTaskPayload {
  @ApiModelProperty()
  korwilTransactionId: string;
}

export class WebMonitoringCoordinatorPhotoPayload {
  @ApiModelProperty()
  korwilTransactionDetailId: string;
}
