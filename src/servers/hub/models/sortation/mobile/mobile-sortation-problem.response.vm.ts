import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationProblemResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => MobileSortationProblemResponseData })
  data: MobileSortationProblemResponseData[];
}

export class MobileSortationProblemResponseData {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  reasonDate: string;
}
