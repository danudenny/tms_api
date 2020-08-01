import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// Payload

export class TrackingAwbPayloadVm {
  @ApiModelProperty()
  awbNumber: string;
}

export class TrackingBagPayloadVm {
  @ApiModelProperty()
  bagNumber: string;
}

export class TrackingBagRepresentativePayloadVm {
  @ApiModelProperty()
  bagRepresentativeNumber: string;
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
  employeeNameScan: string;

  @ApiModelProperty()
  employeeNikScan: string;

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
  partnerLogisticName: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  isHasPhotoReceiver: boolean;

  @ApiModelProperty()
  returnAwbNumber: string;

  @ApiModelProperty()
  awbSubstitute: string;

  @ApiModelProperty()
  doReturnAwb: string;

  @ApiModelProperty()
  isDoReturnPartner: boolean;

  @ApiModelProperty()
  partnerLogisticSubstitute: string;

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

export class AwbSubstituteListData {
  @ApiModelProperty()
  awbSubstitute: string;

  @ApiModelProperty()
  doPodDetailId: string;

  @ApiModelProperty()
  awbSubstituteType: string;
}

export class AwbSubstituteResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbSubstituteListData] })
  data: AwbSubstituteListData[];
}

export class TrackingBagRepresentativeResponseVm {
  @ApiModelProperty()
  bagRepresentativeCode: string;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  bagRepresentativeId: number;

  @ApiModelProperty()
  bagRepresentativeStatusId: number;

  @ApiModelProperty()
  bagRepresentativeStatusName: string;

  @ApiModelProperty({ type: () => [BagRepresentativeHistoryResponseVm] })
  bagRepresentativeHistory: BagRepresentativeHistoryResponseVm[];
}

export class BagRepresentativeHistoryResponseVm {

  @ApiModelProperty()
  bagRepresentativeHistoryId: number;

  @ApiModelProperty()
  bagRepresentativeStatusId: number;

  @ApiModelProperty()
  bagRepresentativeStatusName: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty({ format: 'date-time' })
  historyDate: string;
}
