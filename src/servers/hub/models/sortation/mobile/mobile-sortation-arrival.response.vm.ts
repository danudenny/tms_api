import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationArrivalResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [MobileSortationArrivalDataVm] })
  data: MobileSortationArrivalDataVm[];
}

export class MobileSortationArrivalDataVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  arrivalDateTime: string;
}
