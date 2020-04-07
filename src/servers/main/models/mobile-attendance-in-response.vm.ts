import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileAttendanceInResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  branchName: string;
}

export class MobileAttendanceInitResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  checkInDate: string;

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelPropertyOptional()
  isAttendanceIn?: boolean;
}
