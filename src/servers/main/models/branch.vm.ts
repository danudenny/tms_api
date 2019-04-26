import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BranchVm {
  @ApiModelProperty()
  branch_id: string;

  @ApiModelProperty()
  branch_code: string;

  @ApiModelProperty()
  branch_name: string;
}
