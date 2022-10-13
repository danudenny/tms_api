import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DeleteBagsRequest {
  @ApiModelProperty()
  bag_numbers: [string];
}

export class DeleteAwbsRequest {
  @ApiModelProperty()
  awb_numbers: [string];
}

export class DeleteDoSmdRequest {
  @ApiModelProperty()
  doSmdCode: [string];
}

export class DeleteBaggingRequest {
  @ApiModelProperty()
  baggingId: [string];
}

export class DeleteBagRepresentativeRequest {
  @ApiModelProperty()
  bagRepresentativeId: [string];
}
