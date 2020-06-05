import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class SmdScanBaggingResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  baggingId: string;
}
