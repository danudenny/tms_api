import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationDepatureResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [MobileSortationDepatureDataVm] })
  data: MobileSortationDepatureDataVm[];
}

export class MobileSortationDepatureDataVm {
  @ApiModelProperty()
  doSortationId: number;

  @ApiModelProperty()
  depatureDateTime: string;
}
