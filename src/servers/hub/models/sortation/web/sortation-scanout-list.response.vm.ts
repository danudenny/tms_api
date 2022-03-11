import { BaseMetaResponseVm } from '../../../../../shared/models/base-meta-response.vm';
import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';
class LoadScanOutSortationVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  branchIdTo: number;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  bagItems: string[];
}

export class LoadScanOutSortationResponseVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty({ type: () => [LoadScanOutSortationVm] })
  doSortationDetails: LoadScanOutSortationVm[];
}

class ScanOutSortationListVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  doSortationTime: string;

  @ApiModelProperty()
  fullName: string;

  @ApiModelProperty()
  employeeId: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  branchFromName: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  totalBagSortation: number;

  @ApiModelProperty()
  doSortationStatusTitle: string;

  @ApiModelProperty()
  nickName: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  arrivalDateTime: string;

  @ApiModelProperty()
  departureDateTime: string;
}

export class ScanOutSortationListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [ScanOutSortationListVm] })
  data: ScanOutSortationListVm[];
}

export class ScanOutSortationRouteDetailVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  branchToName: string;
}

export class ScanOutSortationRouteDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [ScanOutSortationRouteDetailVm] })
  data: ScanOutSortationRouteDetailVm[];
}

export class ScanOutSortationBagDetailVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchToName: string;
}

export class ScanOutSortationBagDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [ScanOutSortationBagDetailVm] })
  data: ScanOutSortationBagDetailVm[];
}

export class ScanOutSortationBagDetailMoreResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [ScanOutSortationBagDetailVm] })
  data: ScanOutSortationBagDetailVm[];
}

class ScanOutSortationHistoryVm {
  @ApiModelProperty()
  doSortationHistoryId: string;

  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  branchFromName: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  historyDate: string;

  @ApiModelProperty()
  historyStatus: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  assigne: string;

  @ApiModelProperty()
  reasonNotes: string;
}

export class ScanOutSortationHistoryResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [ScanOutSortationHistoryVm] })
  data: ScanOutSortationHistoryVm[];
}
