import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class InputManualDataPayloadVm {
  @ApiModelProperty()
  bagging_id: string;

  @ApiModelProperty()
  bagging_code: string;

  @ApiModelProperty()
  total_weight: number;

  @ApiModelProperty()
  total_item: number;
}

export class SmdScanBaggingPayloadVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelPropertyOptional()
  representativeCode: string;

  @ApiModelPropertyOptional()
  baggingId: string;

  // NOTE: This is just for BE needs to handle input manual
  @ApiModelPropertyOptional({type: () => InputManualDataPayloadVm})
  inputManualPrevData: InputManualDataPayloadVm;
}

export class SmdScanBaggingMorePayloadVm {
  @ApiModelProperty()
  bagNumber: string[];

  @ApiModelPropertyOptional()
  representativeCode: string;

  @ApiModelPropertyOptional()
  baggingId: string;
}

export class SmdBaggingDetailPayloadVm {
  @ApiModelProperty()
  baggingId: string;
}

export class BaggingCreateHeaderPayloadVm {
  @ApiModelProperty()
  bagNumber: string;
}
