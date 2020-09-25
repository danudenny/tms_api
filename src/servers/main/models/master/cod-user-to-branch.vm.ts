import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class CodUserBranchVm {
  @ApiModelProperty()
  codUserToBranchId: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  firstName: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchCode: string;

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

export class CodUserBranchRemovePayloadVm {
  @ApiModelProperty()
  codUserToBranchIds: string[];
}

// response
export class CodUserBranchRemoveResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

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
