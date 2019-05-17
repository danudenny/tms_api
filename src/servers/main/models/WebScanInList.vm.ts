import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';


export class WebScanInListVm  {
  
  @ApiModelProperty()
  clientId: string;

  @ApiModelProperty({ type: String })
  filters: string[];
}
