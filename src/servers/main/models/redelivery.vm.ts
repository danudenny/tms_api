import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RedeliveryVm {
  @ApiModelProperty()
  history_date_time: Date;

  @ApiModelProperty()
  reason_code: string;

  @ApiModelProperty()
  reason_id: string;

  @ApiModelProperty()
  username: string;


}
