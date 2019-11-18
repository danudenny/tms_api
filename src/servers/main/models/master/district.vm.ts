import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class DistrictVm {
  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  cityId: number;

  @ApiModelProperty()
  zoneId: number;

  @ApiModelProperty()
  branchIdDelivery: number;

  @ApiModelProperty()
  branchIdPickup: number;

  @ApiModelProperty()
  districtCode: string;

  @ApiModelProperty()
  districtName: string;
}

export class DistrictFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DistrictVm] })
  data: DistrictVm[];
}
