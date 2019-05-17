import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';


export class WebScanInFindAllResponseVm  {
  
  @ApiModelProperty()
  total_data: number;

  @ApiModelProperty({ type: String })
  data: string[];
}
