import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileCheckOutResponseVm {

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  checkOutDate: string;

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  checkoutIdBranch: string;
}
