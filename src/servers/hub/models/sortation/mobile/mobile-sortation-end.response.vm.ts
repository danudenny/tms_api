import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationEndResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [MobileSortationEndDataVm] })
  data: MobileSortationEndDataVm[];
}

export class MobileSortationEndDataVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  arrivalDateTime: string;
}
