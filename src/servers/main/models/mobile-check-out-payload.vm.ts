import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileCheckOutPayloadVm {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty()
  dateCheckOut: string;

  @ApiModelProperty()
  longitudeCheckOut: string;

  @ApiModelProperty()
  latitudeCheckOut: string;
}
