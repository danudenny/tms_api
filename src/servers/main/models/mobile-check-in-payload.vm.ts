import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileCheckInPayloadVm {
  @ApiModelProperty()
  dateCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;
}
