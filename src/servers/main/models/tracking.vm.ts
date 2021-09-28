import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
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

export class TrackingBagRepresentativeAwbPayloadVm {
  @ApiModelProperty()
  awbNumber: string;
}

export class TrackingBagRepresentativeDetailPayloadVm {
  @ApiModelProperty()
  bagRepresentativeId: number;
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

export class AwbTransactionHistoryResponseVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty({ format: 'date-time' })
  transactionDate: string;

  @ApiModelProperty()
  transactionStatusId: number;

  @ApiModelProperty()
  transactionStatusCode: string;

  @ApiModelProperty()
  transactionStatusTitle: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  employeeNameScan: string;

  @ApiModelProperty()
  employeeNikScan: string;
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
  isHighValue: boolean;

  @ApiModelProperty()
  awbSubstituteNumber: string;

  @ApiModelProperty()
  partnerLogisticSubstitute: string;

  @ApiModelProperty()
  doPodReturnDetailId: string;

  @ApiModelProperty()
  isHasPhotoReturnRecevier: boolean;

  @ApiModelProperty({ type: () => [AwbHistoryResponseVm] })
  awbHistory: AwbHistoryResponseVm[];

  @ApiModelProperty({ type: () => [AwbTransactionHistoryResponseVm] })
  transactionHistory: AwbTransactionHistoryResponseVm[];
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

  @ApiModelProperty()
  representativeCode: string;

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

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  representativeCode: string;

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
export class AwbPhotoDetailVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelPropertyOptional({ example: 'photo, photoCod, signature'})
  attachmentType: string;
}

export class AwbPhotoDetailResponseVm {
  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  type: string;

  @ApiModelProperty()
  awbNumber: string;
}

export class AwbPhotoResponseVm {
  @ApiModelProperty({ type: () => [AwbPhotoDetailResponseVm] })
  data: AwbPhotoDetailResponseVm[];
}

export class TrackingBagRepresentativeAwbResponseVm {
  @ApiModelProperty()
  bagRepresentativeCode: string;
}

export class TrackingBagRepresentativeDetailResponseVm {
  @ApiModelProperty({ type: () => [TrackingBagRepresentativeAwbDetailResponseVm] })
  bagRepresentativeDetail: TrackingBagRepresentativeAwbDetailResponseVm[];
}

export class TrackingBagRepresentativeAwbDetailResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  totalWeightRealRounded: string;

  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  totalWeight: string;
}
