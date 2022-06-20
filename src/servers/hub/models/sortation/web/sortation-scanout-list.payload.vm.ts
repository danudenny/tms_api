import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../../shared/external/nestjs-swagger';

export class ScanOutSortationRouteDetailPayloadVm {
  @ApiModelProperty()
  doSortationId: string;
}

export class ScanOutSortationBagDetailPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelPropertyOptional()
  isSortir?: boolean | string;
}

export class ScanOutSortationImagePayloadVm {
  @ApiModelProperty()
  doSortationHistoryId: string;

  @ApiModelProperty()
  doSortationStatusId: number;
}
