import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// response
export class ReasonSmdFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  data: ReasonVm[];
}

export class ReasonVm {
  @ApiModelProperty()
  reason_id: number;

  @ApiModelProperty()
  reason_code: string;

  @ApiModelProperty()
  reason_name: string;

  @ApiModelProperty()
  reason_category: string;

  @ApiModelProperty()
  reason_type: string;

}
