import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebAwbScanPriorityResponse {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  routeAndPriority: string;

  @ApiModelProperty()
  kelurahan: string;
}