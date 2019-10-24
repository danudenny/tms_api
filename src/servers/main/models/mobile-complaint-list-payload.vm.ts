import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileComplaintListPayloadVm {
  @ApiModelProperty()
  date_start: string;

  @ApiModelProperty()
  date_end: string;
}
