import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileCheckOutPayloadVm {
  @ApiModelProperty()
  dateCheckOut: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;

  @ApiModelPropertyOptional()
  branchId?: string;
}

export class MobileCheckOutFormPayloadVm {
  @ApiModelProperty()
  dateCheckOut: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;

  @ApiModelPropertyOptional()
  branchId?: string;
}
