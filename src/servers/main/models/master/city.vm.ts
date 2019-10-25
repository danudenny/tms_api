import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class CityVm {
  @ApiModelProperty()
  cityId: number;

  @ApiModelProperty()
  provinceId: number;

  @ApiModelProperty()
  cityCode: string;

  @ApiModelProperty()
  cityName: string;

  @ApiModelProperty()
  cityType: string;
}

export class CityFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [CityVm] })
  data: CityVm[];
}
