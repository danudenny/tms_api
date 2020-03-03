import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileGoResponseVm {

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelPropertyOptional()
  branchNameStart?: string;

  @ApiModelProperty()
  startDate: string;

  // @ApiModelPropertyOptional()
  // isCheckIn?: boolean;

}
