import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileAttendanceInPayloadVm {
  @ApiModelProperty()
  dateCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;

  @ApiModelProperty()
  branchIdCheckIn: string;

  @ApiModelProperty()
  employeeId: string;
}
