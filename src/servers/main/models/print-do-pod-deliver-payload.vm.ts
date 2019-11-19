import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoPodDeliverPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  printCopy: number;
}
