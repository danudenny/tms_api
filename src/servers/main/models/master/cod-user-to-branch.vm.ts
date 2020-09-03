import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class CodUserBranchVm {
  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchName: string;
}

// payload
export class CodUserBranchAddPayloadVm {
  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchIds: number[];
}

// response
export class CodUserBranchAddResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  totalBranch: number;
}

export class CodUserBranchListtResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [CodUserBranchVm] })
  data: CodUserBranchVm[];
}
