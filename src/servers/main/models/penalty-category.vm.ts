import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PenaltyCategoryVm {
  @ApiModelProperty()
  penaltyCategoryTitle: string;

  @ApiModelProperty()
  penaltyCategoryProcess: string;
}

export class PenaltyCategoryListResponseVm extends BaseMetaResponseVm{
  @ApiModelProperty({ type: () => [PenaltyCategoryVm] })
  data: PenaltyCategoryVm[];
}