import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class PackageTypeVm {
  @ApiModelProperty()
  packageTypeId: number;

  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  packageTypeName: string;

  @ApiModelProperty()
  minWeight: number;

  @ApiModelProperty()
  weightRoundingConst: number;

  @ApiModelProperty()
  weightRoundingUpGlobal: number;

  @ApiModelProperty()
  weightRoundingUpDetail: number;

  @ApiModelProperty()
  dividerVolume: number;

  @ApiModelProperty()
  leadTimeMinDays: number;

  @ApiModelProperty()
  leadTimeMaxDays: number;
}

// response
export class PackageTypeResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [PackageTypeVm] })
  data: PackageTypeVm[];
}
