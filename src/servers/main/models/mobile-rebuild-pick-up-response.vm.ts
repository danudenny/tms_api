import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileRebuildPickUpServiceResponse {
  @ApiModelProperty()
  delivery: number;

  @ApiModelProperty()
  codAmount: number;
}