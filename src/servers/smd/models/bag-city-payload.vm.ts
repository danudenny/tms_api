import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class BagCityPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelPropertyOptional()
  representativeId: string;

  @ApiModelPropertyOptional()
  bagRepresentativeId: string;
}

export class BagCityExportPayloadVm extends BaseMetaPayloadVm {
  @ApiModelPropertyOptional()
  userId: string;

  @ApiModelPropertyOptional()
  branchId: string;

  @ApiModelProperty()
  id: string;
}