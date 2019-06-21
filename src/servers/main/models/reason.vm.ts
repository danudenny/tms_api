import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ReasonVm {
  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonCode: string;

  @ApiModelProperty()
  reasonName: string;
}

export class ReasonSearchVm {
  @ApiModelProperty()
  search: string;

}

export class ReasonPayloadVm {
  @ApiModelProperty({ type: () => ReasonSearchVm })
  filters: ReasonSearchVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}

// response
export class ReasonFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  data: ReasonVm[];
}
