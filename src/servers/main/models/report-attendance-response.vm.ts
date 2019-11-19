import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ReportAttendanceResponseVm {

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  branchAsalName: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  checkInDate: string;

  @ApiModelProperty()
  checkIOutDate: string;

  @ApiModelProperty()
  branchIdCheckIn: string;

  @ApiModelProperty()
  branchIdCheckOut: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;

}
