import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class SmdScanBaggingPayloadVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelPropertyOptional()
  baggingId: string;
}
