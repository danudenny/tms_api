import { ApiModelProperty } from 'src/shared/external/nestjs-swagger';

export class MobileCheckOutResponseVm {

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  checkOutDate: string;
}
