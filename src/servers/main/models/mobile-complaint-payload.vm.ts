import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileComplaintPayloadVm {
  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  subject: string;

  @ApiModelProperty()
  recipient: string;
}
