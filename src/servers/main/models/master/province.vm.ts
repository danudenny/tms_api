import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class ProvinceVm {
  @ApiModelProperty()
  provinceId: number;

  @ApiModelProperty()
  provinceCode: string;

  @ApiModelProperty()
  provinceName: string;
}

export class ProvinceFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ProvinceVm] })
  data: ProvinceVm[];
}
