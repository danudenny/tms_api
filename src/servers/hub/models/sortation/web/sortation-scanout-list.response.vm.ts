import { BaseMetaResponseVm } from '../../../../../shared/models/base-meta-response.vm';
import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';
class LoadDoSortationVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  branchIdTo: number;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  bagItems: string[];
}

export class LoadDoSortationResponseVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty({ type: () => [LoadDoSortationVm] })
  doSortationDetails: LoadDoSortationVm[];
}

class DoSortationListVm {
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
  bracnhFromName: string;

  @ApiModelProperty()
  bracnhToName: string;

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

export class DoSortationListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoSortationListVm] })
  data: DoSortationListVm[];
}

export class DoSortationRouteDetailVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  branchToName: string;
}

export class DoSortationRouteDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoSortationRouteDetailVm] })
  data: DoSortationRouteDetailVm[];
}

export class DoSortationBagDetailVm {
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

export class DoSortationBagDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoSortationBagDetailVm] })
  data: DoSortationBagDetailVm[];
}

export class DoSortationBagDetailMoreResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoSortationBagDetailVm] })
  data: DoSortationBagDetailVm[];
}

class DoSortationHistoryVm {
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

export class DoSortationHistoryResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [DoSortationHistoryVm] })
  data: DoSortationHistoryVm[];
}
