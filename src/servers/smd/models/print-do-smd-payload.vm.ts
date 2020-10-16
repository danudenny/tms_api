import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoSmdPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  printCopy: number;
}
