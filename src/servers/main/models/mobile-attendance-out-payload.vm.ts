import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ApiModelPropertyOptional } from '@nestjs/swagger';

export class MobileAttendanceOutPayloadVm {
  @ApiModelProperty()
  dateCheckOut: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;

  @ApiModelPropertyOptional()
  branchIdCheckout?: string;

  @ApiModelPropertyOptional()
  branchCode?: string;

}
