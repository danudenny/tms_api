import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoPodBagPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  printCopy: number;

  @ApiModelProperty()
  type: string;
}
