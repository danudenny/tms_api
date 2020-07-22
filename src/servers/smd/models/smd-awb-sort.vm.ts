import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class SmdAwbSortPayloadVm {
  @ApiModelProperty()
  awbNumber: string;
}

export class SmdAwbSortVm {
  @ApiModelProperty()
  key: string;

  @ApiModelProperty()
  value: string;
}

export class SmdAwbSortResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  urlSound: string;

  @ApiModelProperty({ type: () => SmdAwbSortVm})
  city: SmdAwbSortVm;

  @ApiModelProperty({ type: () => SmdAwbSortVm})
  district: SmdAwbSortVm;

  @ApiModelProperty({ type: () => SmdAwbSortVm})
  subDistrict: SmdAwbSortVm;

}
