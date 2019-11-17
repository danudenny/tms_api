import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ReportAttendancePayloadVm {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;
}
