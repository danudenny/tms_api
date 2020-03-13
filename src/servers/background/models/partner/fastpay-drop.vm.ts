import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DropCashlessVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  branchId: string;

}
