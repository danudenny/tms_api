import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class BagCityPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelPropertyOptional()
  representativeId: string;

  @ApiModelPropertyOptional()
  bagRepresentativeId: string;
}
