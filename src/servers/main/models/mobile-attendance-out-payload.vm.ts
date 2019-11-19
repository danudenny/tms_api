import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

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
