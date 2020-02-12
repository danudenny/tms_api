import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileCheckInPayloadVm {
  @ApiModelProperty()
  dateCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;
}

export class MobileCheckInFormPayloadVm {
  @ApiModelProperty()
  dateCheckIn: string;

  @ApiModelProperty()
  longitudeCheckIn: string;

  @ApiModelProperty()
  latitudeCheckIn: string;

  @ApiModelPropertyOptional()
  branchId?: string;
}