import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';

abstract class ListPayloadVm {
  @ApiModelPropertyOptional()
  page?: number;

  @ApiModelPropertyOptional()
  limit?: number;

  @ApiModelPropertyOptional()
  sortBy?: string;

  @ApiModelPropertyOptional()
  sortDir?: 'ASC' | 'DESC';
}

export class SortationScanOutPayloadVm {
  @ApiModelProperty()
  employeeDriverId: number;

  @ApiModelProperty()
  doSortationDate: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  sortationTrip: number;

  @ApiModelProperty()
  desc: string;
}

export class SortationScanoutRoutePayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  branchCode: string;
}

export class SortationScanOutBagsPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  bagNumbers: string[];
}

export class LoadDoSortationPayloadVm {
  @ApiModelProperty()
  doSortationId: string;
}

class DoSortationListFilterVm {
  @ApiModelProperty()
  startDate?: Date;

  @ApiModelProperty()
  endDate?: Date;

  @ApiModelProperty()
  branchIdFrom?: number;

  @ApiModelProperty()
  branchIdTo  ?: number;

  @ApiModelProperty()
  doSortationCode  ?: number;
}

class DoSortationBagMoreFilterVm {
  @ApiModelProperty()
  doSortationDetailId?: string;

  @ApiModelProperty()
  isSortir?: boolean;
}

class DoSortationHistoryFilterVm {
  @ApiModelProperty()
  doSortationId?: string;

  @ApiModelProperty()
  historyDate?: boolean;

  @ApiModelProperty()
  historyStatus?: string;
}

export class DoSortationtListPayloadVm extends ListPayloadVm {
  @ApiModelPropertyOptional({ type: () => DoSortationListFilterVm })
  filters?: DoSortationListFilterVm;

  @ApiModelPropertyOptional()
  sortBy?:
    | 'createdTime'
    | 'doSortationTime'
    | 'departureDateTime'
    | 'arrivalDateTime'
    | 'branchIdFrom'
    | 'branchIdTo'
    | 'totalBag'
    | 'totalBagSortation'
    | 'doSortationStatusTitle'
    | 'vehicleNumber'
    | 'nickName';
}

export class DoSortationBagMorePayloadVm extends ListPayloadVm {
  @ApiModelPropertyOptional({ type: () => DoSortationBagMoreFilterVm })
  filters?: DoSortationBagMoreFilterVm;

  @ApiModelPropertyOptional()
  sortBy?:
    | 'doSortationDetailId'
    | 'isSortir';
}

export class DoSortationHistoryPayloadVm extends ListPayloadVm {
  @ApiModelPropertyOptional({ type: () => DoSortationHistoryFilterVm })
  filters?: DoSortationHistoryFilterVm;

  @ApiModelPropertyOptional()
  sortBy?:
    | 'historyDate'
    | 'historyStatus'
    | 'username'
    | 'assignee';
}
