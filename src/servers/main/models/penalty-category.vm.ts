import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PenaltyCategoryPayloadVm {
  @ApiModelProperty()
  penaltyCategoryTitle: string;

  @ApiModelProperty()
  penaltyFee: number;

  @ApiModelPropertyOptional()
  penaltyCategoryFeeId: string;
}

export class PenaltyCategoryVm {
  @ApiModelProperty()
  penaltyCategoryTitle: string;

  @ApiModelProperty()
  penaltyCategoryProcess: string;

  @ApiModelProperty()
  penaltyCategoryId: string;
}
export class PenaltyCategoryListResponseVm extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [PenaltyCategoryVm] })
  data: PenaltyCategoryVm[];
}

export class PenaltyCategoryFeeVm {
  @ApiModelProperty()
  penaltyCategoryTitle: string;

  @ApiModelProperty()
  penaltyCategoryProcess: string;

  @ApiModelProperty()
  penaltyCategoryId: string;

  @ApiModelProperty()
  penaltyFee: string;

  @ApiModelProperty()
  penaltyCategoryFeeId: string;
}
export class PenaltyCategoryFeeListResponseVm extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [PenaltyCategoryFeeVm] })
  data: PenaltyCategoryFeeVm[];
}