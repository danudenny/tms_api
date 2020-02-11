import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileCheckInResponseVm {

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  checkInDate: String;

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelPropertyOptional()
  isCheckIn?: boolean;

  @ApiModelPropertyOptional()
  checkinIdBranch?: string;
}

export class MobileInitCheckInResponseVm {
  @ApiModelProperty()
  checkIn: MobileCheckInResponseVm;
}
