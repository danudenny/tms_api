import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileDeliveryHistoryVm {
  @ApiModelProperty()
  doPodDeliverHistoryId: number;

  @ApiModelProperty({ format: 'date-time' })
  historyDateTime: string;

  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonCode: string;

  @ApiModelProperty()
  reasonNotes: string;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  latitudeDelivery: string;

  @ApiModelProperty()
  longitudeDelivery: string;
}
