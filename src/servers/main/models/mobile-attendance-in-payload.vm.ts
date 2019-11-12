import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileAttendanceInPayloadVm {
  @ApiModelProperty()
  dateCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;

  @ApiModelPropertyOptional()
  branchIdCheckIn?: string;

  @ApiModelPropertyOptional()
  branchCode?: string;

}
