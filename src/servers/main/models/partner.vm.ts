import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class PartnerVm {
  @ApiModelProperty()
  partnerId: string;

  @ApiModelProperty()
  partnerName: string;
}

export class PartnerSearchVm {
  @ApiModelProperty()
  search: string;

}

export class PartnerPayloadVm {
  @ApiModelProperty({ type: () => PartnerSearchVm })
  filters: PartnerSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'partner__name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}

// response
export class PartnerFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [PartnerVm] })
  data: PartnerVm[];
}
