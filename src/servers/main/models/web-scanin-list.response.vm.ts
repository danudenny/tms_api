import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { WebScanInResponseVm, WebScanInBagResponseVm } from './web-scanin.response.vm';

export class WebScanInListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInResponseVm] })
  data: WebScanInResponseVm[];
}

export class WebScanInBagListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInBagResponseVm] })
  data: WebScanInBagResponseVm[];
}
