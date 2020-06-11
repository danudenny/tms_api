import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebAwbSortPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  type: string;
}

export class WebAwbSortVm {
  @ApiModelProperty()
  key: string;

  @ApiModelProperty()
  value: string;
}

export class WebAwbSortResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty({ example: 'subDistrict'})
  type: string;

  @ApiModelProperty()
  urlSound: string;

  @ApiModelProperty({ type: () => WebAwbSortVm})
  city: WebAwbSortVm;

  @ApiModelProperty({ type: () => WebAwbSortVm})
  district: WebAwbSortVm;

  @ApiModelProperty({ type: () => WebAwbSortVm})
  subDistrict: WebAwbSortVm;

}
