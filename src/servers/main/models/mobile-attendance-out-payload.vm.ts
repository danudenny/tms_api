import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileAttendanceOutPayloadVm {
  @ApiModelProperty()
  dateCheckOut: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;

  @ApiModelProperty()
  branchIdCheckout: string;

}
