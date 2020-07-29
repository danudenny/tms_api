import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class BagCityResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  representativeId: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  bagRepresentativeId: string;

  @ApiModelProperty()
  bagRepresentativeCode: string;
  
}

export class ListBagCityDetailVm {
  @ApiModelProperty()
  bagRepresentativeId: string;

  @ApiModelProperty()
  bagRepresentativeCode: string;

  @ApiModelProperty()
  branchBagRepresentative: string;

  @ApiModelProperty()
  bagRepresentativeDate: string;

  @ApiModelProperty()
  bagRepresentativeScanDate: string;

  @ApiModelProperty()
  totalItem: string;

  @ApiModelProperty()
  totalWeight: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  representativeName: string;

  @ApiModelProperty()
  user: string;
}
export class ListBagCityResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListBagCityDetailVm] })
  data: ListBagCityDetailVm[];
}

export class ListDetailBagCityDataVm {
  @ApiModelProperty()
  bagRepresentativeItemId: string;

  @ApiModelProperty()
  bagRepresentativeId: string;

  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  bagNumber: string;
}
export class ListDetailBagCityResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListDetailBagCityDataVm] })
  data: ListDetailBagCityDataVm[];
}