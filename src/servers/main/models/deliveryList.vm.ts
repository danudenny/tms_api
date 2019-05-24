import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class DeliveryListVm {
  @ApiModelProperty()
  historyDateTime: Date;

  @ApiModelProperty()
  reasonCode: string;

  @ApiModelProperty()
  reasonNote: string;

  @ApiModelProperty()
  employeeName: string;
}
