import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class ValidateBranchCoordinateResponseVm {
  @ApiModelProperty()
  status: boolean;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  error: string;

  @ApiModelProperty()
  branchId: string;
}

export class BranchMessageResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  branchId: string;
}