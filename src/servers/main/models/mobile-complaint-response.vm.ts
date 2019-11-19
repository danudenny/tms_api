import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileComplaintResponseVm {
  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  code: string;


}
