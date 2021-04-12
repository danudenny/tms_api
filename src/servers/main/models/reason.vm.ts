import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ReasonVm {
  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonCode: string;

  @ApiModelProperty()
  reasonName: string;

  @ApiModelProperty()
  reasonCategory: string;

  @ApiModelProperty()
  reasonType: string;

  @ApiModelProperty()
  isDeleted: boolean;

}

export class ReasonSearchVm {
  @ApiModelProperty()
  search: string;

}

export class ReasonPayloadVm {
  @ApiModelPropertyOptional({ type: () => ReasonSearchVm })
  filters?: ReasonSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'reason_name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}

// response
export class ReasonFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  data: ReasonVm[];
}
