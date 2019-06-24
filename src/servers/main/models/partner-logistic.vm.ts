import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class PartnerLogisticVm {
  @ApiModelProperty()
  partnerLogisticId: number;

  @ApiModelProperty()
  partnerLogisticEmail: string;

  @ApiModelProperty()
  partnerLogisticName: string;
}

export class PartnerLogisticSearchVm {
  @ApiModelProperty()
  search: string;

}

export class PartnerLogisticPayloadVm {
  @ApiModelProperty({ type: () => PartnerLogisticSearchVm })
  filters: PartnerLogisticSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'partner_logistic_name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}

// response
export class PartnerLogisticFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [PartnerLogisticVm] })
  data: PartnerLogisticVm[];
}
