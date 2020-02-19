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
  awbVisibility: string;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  direction: string;

  @ApiModelProperty()
  noteInternal: string;

  @ApiModelProperty()
  notePublic: string;
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
  createdName: string;

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

  @ApiModelProperty()
  isCod: string;

  @ApiModelProperty()
  totalWeightVolume: string;

  @ApiModelProperty()
  totalWeightVolumeReal: string;

  @ApiModelProperty()
  refResellerPhone: string;

  @ApiModelProperty()
  consigneePhone: string;

  @ApiModelProperty()
  refRepresentativeCode: string;

  @ApiModelProperty()
  parcelValue: string;

  @ApiModelProperty()
  partnerLogisticAwb: string;

  @ApiModelProperty()
  url: string;

  @ApiModelProperty({ type: () => [AwbHistoryResponseVm] })
  awbHistory: AwbHistoryResponseVm[];
}

export class BagHistoryResponseVm {
  @ApiModelProperty()
  bagItemStatusId: number;

  @ApiModelProperty()
  bagItemStatusName: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty({ format: 'date-time' })
  historyDate: string;
}

export class TrackingBagResponseVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagItemStatusId: number;

  @ApiModelProperty()
  bagItemStatusName: string;

  @ApiModelProperty()
  branchCodeLast: string;

  @ApiModelProperty()
  branchNameLast: string;

  @ApiModelProperty()
  branchCodeNext: string;

  @ApiModelProperty()
  branchNameNext: string;

  @ApiModelProperty({ type: () => [BagHistoryResponseVm] })
  bagHistory: BagHistoryResponseVm[];
}
