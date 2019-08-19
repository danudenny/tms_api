import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { WebAwbFilterResponseVm, WebAwbListPodResponseVm } from './web-awb-filter-response.vm';

export class WebAwbFilterListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebAwbFilterResponseVm] })
  data: WebAwbFilterResponseVm[];
}

export class WebAwbFListPodResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebAwbListPodResponseVm] })
  data: WebAwbListPodResponseVm[];
}
