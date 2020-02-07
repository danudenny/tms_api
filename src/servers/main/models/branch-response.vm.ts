import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class ValidateBranchKoordinateResponseVm {
  @ApiModelProperty()
  status: boolean;

  @ApiModelProperty()
  message: string;
}