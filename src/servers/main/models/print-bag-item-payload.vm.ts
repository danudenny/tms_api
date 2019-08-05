import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintBagItemPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;
}
