import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class PartnerLogisticVm {
  @ApiModelProperty()
  partnerLogisticId: number;

  @ApiModelProperty()
  partnerLogisticCode: string;

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
export class PartnerLogisticFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [PartnerLogisticVm] })
  data: PartnerLogisticVm[];
}
