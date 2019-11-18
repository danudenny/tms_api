import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';


export class WebScanInBagResponseVm  {

  @ApiModelProperty()
  total_data: number;

  @ApiModelProperty({ type: String })
  data: string[];
}
