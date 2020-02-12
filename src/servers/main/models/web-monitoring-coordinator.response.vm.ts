import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebMonitoringCoordinatorData {
  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  coordinatorName: string;

  @ApiModelProperty()
  countTask: number;

  @ApiModelProperty()
  countChecklist: number;

  @ApiModelProperty()
  checkInDatetime: string;

  @ApiModelProperty()
  checkOutDatetime: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty()
  date: string;

  @ApiModelProperty()
  statusTransaction: string;
}

export class WebMonitoringCoordinatorResponse extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebMonitoringCoordinatorData] })
  data: WebMonitoringCoordinatorData[];
}

export class WebMonitoringCoordinatorListData {
  @ApiModelProperty()
  coordinatorName: string;

  @ApiModelProperty()
  userId: string;

  @ApiModelProperty()
  countBranch: number;

  @ApiModelProperty()
  countVisit: number;

  @ApiModelProperty()
  checkInDatetime: string;

  @ApiModelProperty()
  checkOutDatetime: string;
}

export class WebMonitoringCoordinatorListResponse extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebMonitoringCoordinatorListData] })
  data: WebMonitoringCoordinatorListData[];
}

export class WebMonitoringCoordinatorTaskData {
  @ApiModelProperty()
  korwilTransactionDetailId: string;

  @ApiModelProperty()
  task: string;

  @ApiModelProperty()
  countPhoto: number;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  status: string;
}
export class WebMonitoringCoordinatorTaskResponse {
  @ApiModelProperty({ type: () => [WebMonitoringCoordinatorTaskData] })
  data: WebMonitoringCoordinatorTaskData[];
}

export class WebMonitoringCoordinatorDetailResponse {
  @ApiModelProperty()
  userId: string;

  @ApiModelProperty()
  coordinatorName: string;

  @ApiModelProperty()
  branch: number[];
}

export class WebMonitoringCoordinatorPhotoResponse {
  @ApiModelProperty()
  url: string[];
}

export class CreateTransactionCoordinatorResponse {
  @ApiModelProperty()
  status: boolean;

  @ApiModelProperty()
  message: string;
}

export class TaskHeader {
  @ApiModelProperty()
  representative: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  date: string;

  @ApiModelProperty()
  checkInDatetime: string;

  @ApiModelProperty()
  checkOutDatetime: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  countChecklist: string;
}
export class TaskDetail {
  @ApiModelProperty()
  task: string;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  url: string[];
}
export class WebMonitoringCoordinatorTaskReportResponse {
  @ApiModelProperty({ type: () => TaskHeader })
  transactionHeader: TaskHeader;

  @ApiModelProperty({ type: () => [TaskDetail] })
  transactionDetail: TaskDetail[];
}
