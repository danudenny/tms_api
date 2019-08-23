import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebAwbFilterFinishScanResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class AwbProblemFilterVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  podFilterDetailItemId: number;

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  message: string;
}

export class WebAwbFilterScanAwbResponseVm {

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}

export class DistrictVm {
  @ApiModelProperty()
  districtCode: string;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalScan: number;

  @ApiModelProperty()
  totalFiltered: number;

  @ApiModelProperty()
  totalProblem: number;
}

export class WebAwbFilterScanBagResponseVm {

  @ApiModelProperty()
  bagNumberSeq: string;

  @ApiModelProperty()
  isActive: boolean;

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalFiltered: number;

  @ApiModelProperty()
  totalProblem: number;

  @ApiModelProperty()
  totalScan: number;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  podFilterId: number;

  @ApiModelProperty()
  podFilterDetailId: number;

  @ApiModelProperty()
  podFilterCode: string;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty({ type: [DistrictVm] })
  data: DistrictVm[];
}

export class WebAwbFilterResponseVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagNumberSeq: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalFiltered: number;

  @ApiModelProperty()
  diffFiltered: number;

  @ApiModelProperty()
  moreFiltered: number;

  @ApiModelProperty()
  totalItem: number;

  @ApiModelProperty()
  isActive: boolean;
}

export class WebAwbListPodResponseVm {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbDate: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusIdLast: number;

  @ApiModelProperty()
  fromId: number;

  @ApiModelProperty()
  toId: number;

  @ApiModelProperty()
  awbStatusTitle: string;

  @ApiModelProperty()
  districtNameFrom: string;

  @ApiModelProperty()
  districtNameTo: string;

  @ApiModelProperty()
  isProblem: boolean;
}

export class WebAwbFilterGetLatestResponseVm {

  @ApiModelProperty({ type: [WebAwbFilterScanBagResponseVm] })
  data: WebAwbFilterScanBagResponseVm[];

  @ApiModelProperty({ type: [AwbProblemFilterVm] })
  awbProblems: AwbProblemFilterVm[];
}
