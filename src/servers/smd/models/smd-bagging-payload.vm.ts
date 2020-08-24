import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class SmdScanBaggingPayloadVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelPropertyOptional()
  representativeCode: string;

  @ApiModelPropertyOptional()
  baggingId: string;
}

export class SmdScanBaggingMorePayloadVm {
  @ApiModelProperty()
  bagNumber: string[];

  @ApiModelPropertyOptional()
  representativeCode: string;

  @ApiModelPropertyOptional()
  baggingId: string;
}
