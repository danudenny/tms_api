import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileCheckOutPayloadVm {
  @ApiModelProperty()
  dateCheckOut: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;
}
