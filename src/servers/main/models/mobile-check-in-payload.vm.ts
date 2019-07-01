import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileCheckInPayloadVm {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty()
  dateCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;
}