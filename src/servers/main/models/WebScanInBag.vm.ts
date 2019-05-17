import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';


export class WebScanInBagVm  {
  
  @ApiModelProperty()
  clientId: string;

  @ApiModelProperty({ type: String })
  bagNumber: string[];
}
