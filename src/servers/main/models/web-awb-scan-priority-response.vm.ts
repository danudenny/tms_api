import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebAwbScanPriorityResponse extends BaseMetaResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  routeAndPriority: string;
}