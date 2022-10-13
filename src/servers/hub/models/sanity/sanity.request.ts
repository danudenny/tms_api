import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DeleteBagsRequest {
  @ApiModelProperty()
  bagNumbers: [string];
}

export class DeleteDoSmdRequest {
  @ApiModelProperty()
  doSmdId: string;
}

export class DeleteBaggingRequest {
  @ApiModelProperty()
  baggingId: [string];
}

export class DeleteBagRepresentativeRequest {
  @ApiModelProperty()
  bagRepresentativeId: [string];
}
