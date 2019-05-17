import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebScanInVm  {
  
  @ApiModelProperty()
  clientId: string;

  @ApiModelProperty({ type: String })
  awbNumber: string[];
}
