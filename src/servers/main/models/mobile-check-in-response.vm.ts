import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileCheckInResponseVm {

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  checkInDate: string;
}
