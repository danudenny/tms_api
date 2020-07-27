import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BagCityResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  representativeId: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  bagRepresentativeId: string;

  @ApiModelProperty()
  bagRepresentativeCode: string;
  
}

