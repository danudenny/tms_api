import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationHandoverResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [MobileSortationHandoverData] })
  data: MobileSortationHandoverData[];
}

export class MobileSortationHandoverData {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  handoverDate: string;
}
