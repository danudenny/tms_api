import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebScanInVm  {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty()
  awbNumber: string[];
}
