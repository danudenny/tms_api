import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileDeliveryHistoryVm {
  @ApiModelProperty()
  doPodDeliverHistoryId: number;

  @ApiModelProperty()
  historyDateTime: Date;

  @ApiModelProperty()
  reasonCode: string;

  @ApiModelProperty()
  reasonId: number;

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
