import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationContinueResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type : () => [MobileSortationContinueDataVm]})
  data: MobileSortationContinueDataVm[];
}

export class MobileSortationContinueDataVm {
  @ApiModelProperty()
  statusCode: string;
}