import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../../../shared/external/nestjs-swagger';

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

class DoSortationListFilterVm {
  @ApiModelProperty()
  startDate?: Date;

  @ApiModelProperty()
  endDate?: Date;

  @ApiModelProperty()
  branchIdFrom?: number;

  @ApiModelProperty()
  branchIdTo?: number;

  @ApiModelProperty()
  doSortationCode?: number;
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

export class ScanOutSortationRouteDetailPayloadVm {
  @ApiModelProperty()
  doSortationId: string;
}
