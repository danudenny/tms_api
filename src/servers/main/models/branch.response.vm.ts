import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { BranchVm } from './branch.vm';

export class BranchFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [BranchVm] })
  data: BranchVm[];
}