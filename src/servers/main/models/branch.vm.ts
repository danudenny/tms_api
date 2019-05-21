import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BranchVm {
  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchName: string;
}
