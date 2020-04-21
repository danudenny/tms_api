import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { WebScanInResponseVm, WebScanInBagResponseVm, WebScanInBranchResponseVm, WebScanInHubSortResponseVm, WebScanInBranchBagResponseVm, WebScanInBranchAwbResponseVm, WebDropOffSummaryResponseVm } from './web-scanin.response.vm';

export class WebScanInListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInResponseVm] })
  data: WebScanInResponseVm[];
}

export class WebScanInBagListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInBagResponseVm] })
  data: WebScanInBagResponseVm[];
}

export class WebScanInBranchListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInBranchResponseVm] })
  data: WebScanInBranchResponseVm[];
}

export class WebScanInBranchListBagResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInBranchBagResponseVm] })
  data: WebScanInBranchBagResponseVm[];
}

export class WebScanInBranchListAwbResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInBranchAwbResponseVm] })
  data: WebScanInBranchAwbResponseVm[];
}

export class WebScanInHubSortListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInHubSortResponseVm] })
  data: WebScanInHubSortResponseVm[];
}

export class WebDropOffSummaryListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebDropOffSummaryResponseVm] })
  data: WebDropOffSummaryResponseVm[];
}
