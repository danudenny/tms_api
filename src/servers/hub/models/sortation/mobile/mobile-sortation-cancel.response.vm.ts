import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationCancelResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [MobileSortationCancelDataVm] })
  data: MobileSortationCancelDataVm[];
}

export class MobileSortationCancelDataVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  arrivalDateTime: string;
}
