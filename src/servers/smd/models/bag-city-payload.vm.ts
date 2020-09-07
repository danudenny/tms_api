import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class BagCityInputManualDataPayloadVm {
  @ApiModelProperty()
  bag_representative_code: string;

  @ApiModelProperty()
  bag_representative_id: number;

  @ApiModelProperty()
  total_item: number;

  @ApiModelProperty()
  total_weight: number;
}

export class BagCityMorePayloadVm {
  @ApiModelProperty()
  awbNumber: string[];

  @ApiModelPropertyOptional()
  representativeId: string;

  @ApiModelPropertyOptional()
  bagRepresentativeId: string;
}

export class BagCityPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelPropertyOptional()
  representativeId: string;

  @ApiModelPropertyOptional()
  bagRepresentativeId: string;

  @ApiModelPropertyOptional({ type: () => BagCityInputManualDataPayloadVm })
  inputManualPrevData: BagCityInputManualDataPayloadVm;
}

export class BagCityExportPayloadVm extends BaseMetaPayloadVm {
  @ApiModelPropertyOptional()
  userId: string;

  @ApiModelPropertyOptional()
  branchId: string;

  @ApiModelProperty()
  id: string;
}

export class BagCityDetailScanPayloadVm {
  @ApiModelProperty()
  awbNumber: string[];
}
