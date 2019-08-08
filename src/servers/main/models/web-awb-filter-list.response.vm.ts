import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { WebAwbFilterResponseVm } from './web-awb-filter-response.vm';

export class WebAwbFilterListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebAwbFilterResponseVm] })
  data: WebAwbFilterResponseVm[];
}
