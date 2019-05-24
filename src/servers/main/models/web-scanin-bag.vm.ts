import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';


export class WebScanInBagVm  {

  @ApiModelProperty()
  bagNumber: string[];
}
