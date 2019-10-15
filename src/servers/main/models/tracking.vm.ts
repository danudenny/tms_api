import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

// Payload

export class TrackingAwbPayloadVm {
  @ApiModelProperty()
  awbNumber: string;
}

export class TrackingBagPayloadVm {
  @ApiModelProperty()
  bagNumber: string;
}

// Response
export class AwbHistoryResponseVm {
  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty({ format: 'date-time' })
  historyDate: string;

  @ApiModelProperty()
  employeeIdDriver: number;

  @ApiModelProperty()
  employeeNameDriver: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  direction: string;
}

export class TrackingAwbResponseVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  packageTypeName: string;

  @ApiModelProperty({ format: 'date-time' })
  awbDate: string;

  @ApiModelProperty()
  customerName: string;

  @ApiModelProperty()
  customerNameRds: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  paymentMethodCode: string;

  @ApiModelProperty()
  totalSellPrice: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  totalWeightFinal: number;

  @ApiModelProperty()
  totalWeightFinalRounded: number;

  @ApiModelProperty()
  awbStatusLast: string;

  @ApiModelProperty({ type: () => [AwbHistoryResponseVm] })
  awbHistory: AwbHistoryResponseVm[];
}

export class TrackingBagResponseVm {
  @ApiModelProperty()
  bagNumber: string;
}
