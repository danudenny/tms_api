import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class ValidateBranchCoordinateResponseVm {
  @ApiModelProperty()
  status: boolean;

  @ApiModelProperty()
  message: string;
}