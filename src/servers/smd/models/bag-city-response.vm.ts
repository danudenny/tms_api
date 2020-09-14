import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { BagCityInputManualDataPayloadVm } from './bag-city-payload.vm';

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

  @ApiModelProperty()
  bagRepresentativeItemId: number;

  @ApiModelProperty()
  refAwbNumber: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty({ type: () => BagCityInputManualDataPayloadVm })
  inputManualPrevData: BagCityInputManualDataPayloadVm;
}

export class BagCityDataMoreResponseVm extends BagCityResponseVm {
  @ApiModelProperty()
  awbNumber: string;
}

export class BagCityMoreResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: () => [BagCityDataMoreResponseVm] })
  data: BagCityDataMoreResponseVm[];
}

export class BagCityDataDetailScanResponseVm {
  @ApiModelProperty()
  bagRepresentativeCode: string;

  @ApiModelProperty()
  bagRepresentativeId: string;

  @ApiModelProperty()
  bagRepresentativeItemId: string;

  @ApiModelProperty()
  refAwbNumber: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  representativeId: string;

  @ApiModelProperty()
  weight: string;
}

export class BagCityDetailScanResponseVm {
  @ApiModelProperty({ type: () => [BagCityDataDetailScanResponseVm] })
  data: BagCityDataDetailScanResponseVm[];
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
  refAwbNumber: string;

  @ApiModelProperty()
  weight: string;
}
export class ListDetailBagCityResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListDetailBagCityDataVm] })
  data: ListDetailBagCityDataVm[];
}
