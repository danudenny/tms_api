import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BranchVm {
  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchName: string;
}
