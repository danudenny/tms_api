import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileAttendanceInResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
