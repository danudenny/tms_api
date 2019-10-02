import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebAwbSortirResponseVm {
  @ApiModelProperty()
  districtTo: number;

  @ApiModelProperty()
  districtCode: string;

}
