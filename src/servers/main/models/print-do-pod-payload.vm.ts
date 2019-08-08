import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoPodPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;
}
