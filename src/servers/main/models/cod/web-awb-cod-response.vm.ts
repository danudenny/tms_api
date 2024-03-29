import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class WebCodSuccessResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebItemAwbCodResponseVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty({ format: 'date-time' })
  manifestedDate: string;

  @ApiModelProperty({ format: 'date-time' })
  transactionDate: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  branchIdLast: number;

  @ApiModelProperty()
  branchNameLast: string;

  @ApiModelProperty()
  branchIdFinal: number;

  @ApiModelProperty()
  branchNameFinal: string;

  @ApiModelProperty()
  branchIdCopy: number;

  @ApiModelProperty()
  branchNameCopy: string;

  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  awbStatusIdLast: string;

  @ApiModelProperty()
  awbStatusLast: string;

  @ApiModelProperty()
  awbStatusIdFinal: string;

  @ApiModelProperty()
  awbStatusFinal: string;

  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelPropertyOptional()
  codPaymentMethod: string;

  @ApiModelPropertyOptional()
  codPaymentService: string;

  @ApiModelPropertyOptional()
  noReference: string;

  @ApiModelPropertyOptional()
  transactionStatusId: number;

  @ApiModelPropertyOptional()
  transactionStatusName: string;
}

export class WebAwbCodListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodResponseVm] })
  data: WebItemAwbCodResponseVm[];
}

export class WebItemAwbCodDlvResponseVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty({ format: 'date-time' })
  manifestedDate: string;

  @ApiModelProperty({ format: 'date-time' })
  transactionDate: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  branchIdLast: number;

  @ApiModelProperty()
  branchNameLast: string;

  @ApiModelProperty()
  representativeId: number;

  @ApiModelProperty()
  awbStatusIdLast: string;

  @ApiModelProperty()
  awbStatusIdFinal: string;

  @ApiModelProperty()
  awbStatusLast: string;

  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelPropertyOptional()
  codPaymentMethod: string;

  @ApiModelPropertyOptional()
  codPaymentService: string;

  @ApiModelPropertyOptional()
  noReference: string;

  @ApiModelPropertyOptional()
  transactionStatusId: number;

  @ApiModelPropertyOptional()
  transactionStatusName: string;
}

export class WebAwbCodDlvV2ListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodDlvV2ResponseVm] })
  data: WebItemAwbCodDlvV2ResponseVm[];
}

export class WebItemAwbCodDlvV2ResponseVm {
  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  totalResi: number;

  @ApiModelProperty()
  branchIdFinal: number;

  @ApiModelProperty()
  branchNameFinal: string;
}

export class WebAwbCodDlvListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodDlvResponseVm] })
  data: WebItemAwbCodDlvResponseVm[];
}

export class WebItemAwbCodVoidResponseVM {
  @ApiModelProperty()
  awbNumber: string;
  @ApiModelProperty({ format: 'date-time' })
  manifestedDate: string;
  @ApiModelProperty({ format: 'date-time' })
  voidDatetime: string;
  @ApiModelProperty()
  consigneeName: string;
  @ApiModelProperty()
  packageTypeId: number;
  @ApiModelProperty()
  packageTypeCode: string;
  @ApiModelProperty()
  codValue: number;
  @ApiModelProperty()
  serIdDriver: number;
  @ApiModelProperty()
  userIdAdmin: number;

  @ApiModelProperty()
  adminName: string;
  @ApiModelProperty()
  driverName: string;
  @ApiModelProperty()
  voidNote: string;

  @ApiModelPropertyOptional({ format: 'date-time' })
  transferDatetime: string;
  @ApiModelPropertyOptional()
  userIdHO: number;
  @ApiModelPropertyOptional()
  userHO: string;
}
export class WebAwbCodVoidListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodVoidResponseVM] })
  data: WebItemAwbCodVoidResponseVM[];
}

export class WebTransactionBranchDetail {
  @ApiModelProperty()
  transactionId: string;

  @ApiModelProperty()
  transactionCode: string;

  @ApiModelProperty({ format: 'date-time' })
  transactionDate: string;

  @ApiModelPropertyOptional()
  transactionNote: string;

  @ApiModelProperty()
  transactionStatus: string;

  @ApiModelProperty()
  transactionStatusId: number;

  @ApiModelProperty()
  transactionType: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  adminId: number;

  @ApiModelProperty()
  adminName: string;

  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  driverName: string;
}

export class WebAwbCodListTransactionResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebTransactionBranchDetail] })
  data: WebTransactionBranchDetail[];
}

export class WebCodTransactionUpdateResponseVm extends WebCodSuccessResponseVm {
  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  dataError: string[];
}

export class WebCodBankStatementVm {
  @ApiModelProperty()
  bankStatementId: string;

  @ApiModelProperty()
  bankStatementCode: string;

  @ApiModelProperty({ format: 'date-time' })
  bankStatementDate: string;

  @ApiModelPropertyOptional()
  bankStatementNote: string;

  @ApiModelProperty()
  transactionStatusId: number;

  @ApiModelProperty()
  bankAccount: string;

  @ApiModelProperty()
  transactionStatus: string;

  @ApiModelProperty()
  totalTransaction: number;

  @ApiModelProperty()
  transactionType: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  adminName: string;

  @ApiModelProperty()
  attachmentUrl: string;

  @ApiModelProperty({ format: 'date-time' })
  validateDatetime: string;

  @ApiModelProperty({ format: 'date-time' })
  cancelDatetime: string;

  @ApiModelProperty({ format: 'date-time' })
  transferDatetime: string;

  @ApiModelProperty()
  bankNoReference: string;

  @ApiModelProperty()
  userIdTransfer: number;

  @ApiModelProperty()
  transferName: string;
}

export class WebAwbCodBankStatementResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebCodBankStatementVm] })
  data: WebCodBankStatementVm[];
}

export class WebCodTransferBranchResponseVm {
  // @ApiModelProperty()
  // transactionCode: string;

  // @ApiModelProperty({ format: 'date-time' })
  // transactionDate: string;

  @ApiModelProperty()
  printIdCash: string;

  @ApiModelPropertyOptional()
  printIdCashless: string;

  @ApiModelProperty()
  dataError: string[];
}

export class WebCodTransferBranchCashResponseVm {
  // @ApiModelProperty()
  // transactionCode: string;

  // @ApiModelProperty({ format: 'date-time' })
  // transactionDate: string;

  @ApiModelProperty()
  printIdCash: string;

  @ApiModelProperty()
  dataError: string[];
}

export class WebCodTransferBranchCashlessResponseVm {
  // @ApiModelProperty()
  // transactionCode: string;

  // @ApiModelProperty({ format: 'date-time' })
  // transactionDate: string;

  @ApiModelPropertyOptional()
  printIdCashless: string;

  @ApiModelProperty()
  dataError: string[];
}

export class WebCodAwbValidVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbStatusIdLast: number;

  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  parcelValue: number;
}

export class CodTransactionDetailVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  paymentMethod: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  codValue: number;
}

export class WebCodTransactionDetailResponseVm {
  @ApiModelProperty({ type: () => [CodTransactionDetailVm] })
  data: CodTransactionDetailVm[];
}

export class WebCodTransferHeadOfficeResponseVm extends WebCodSuccessResponseVm {
  @ApiModelProperty()
  dataError: string[];
}

export class WebCodBankStatementResponseVm extends WebCodSuccessResponseVm {}

export class WebAwbCodDetailPartnerVm {
  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  paymentMethod: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  codValue: number;
}

export class WebAwbCodDetailPartnerResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebAwbCodDetailPartnerVm] })
  data: WebAwbCodDetailPartnerVm[];
}

export class AwbTransactionDetailVm {
  parcelNote: string;
  custPackage: string;
  partnerId: number;
  awbItemId: number;
  awbNumber: string;
  currentPositionId: number;
  currentPosition: string;
  awbStatusIdLast: number;
  podDate: string;
  awbDate: string;

  destinationCode: string;
  destinationId: number;
  destination: string;
  packageTypeId: number;
  packageTypeCode: string;
  packageTypeName: string;
  pickupSourceId: number;
  pickupSource: string;

  weightRealRounded: number;
  weightFinalRounded: number;
  consigneeName: string;
  parcelValue: number;
  codValue: number;
  parcelContent: string;
  partnerName: string;
}

// #region Supplier Invoice
export class WebCodInvoiceCreateResponseVm extends WebCodSuccessResponseVm {
  @ApiModelProperty()
  supplierInvoiceId: string;

  @ApiModelProperty()
  supplierInvoiceCode: string;

  @ApiModelProperty()
  supplierInvoiceDate: string;
}

export class WebCodSupplierInvoicePaidResponseVm extends WebCodSuccessResponseVm {}

export class WebCodInvoiceAddResponseVm extends WebCodSuccessResponseVm {
  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  dataError: string[];
}

export class WebCodInvoiceRemoveResponseVm extends WebCodSuccessResponseVm {
  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  dataError: string[];
}

export class WebAwbCodDetailInvoice {
  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  totalAwb: number;
}

export class WebAwbCodSupplierInvoiceResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebAwbCodDetailInvoice] })
  data: WebAwbCodDetailInvoice[];
}

export class WebAwbCodSupplierInvoiceVm {
  @ApiModelProperty()
  packageTypeCode: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  destination: string;

  @ApiModelProperty()
  transactionStatusName: string;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbDate: string;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  transactionStatusId: number;
}

export class WebAwbCodInvoiceResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebAwbCodSupplierInvoiceVm] })
  data: WebAwbCodSupplierInvoiceVm[];
}

export class WebCodInvoiceDraftResponseVm {
  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  supplierInvoiceCode: string;

  @ApiModelProperty()
  supplierInvoiceDate: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalCodValue: string;
}

export class WebCodSupploerInvoiceVm {
  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  supplierInvoiceId: string;

  @ApiModelProperty()
  supplierInvoiceCode: string;

  @ApiModelProperty({ format: 'date-time' })
  supplierInvoiceDate: string;

  @ApiModelProperty()
  supplierInvoiceStatusId: number;

  @ApiModelProperty({ format: 'date-time' })
  paidDatetime: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  supplierInvoiceStatus: string;

  @ApiModelProperty()
  adminName: string;
}

export class WebCodListInvoiceResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebCodSupploerInvoiceVm] })
  data: WebCodSupploerInvoiceVm[];
}

export class WebCodAwbDelivery {
  awbItemId: number;
  awbNumber: string;
  codValue: number;
  userIdDriver: number;
  paymentMethod: string;
  paymentService: string;
  noReference: string;
}
// #endregion

// #region for data printing
export class WebCodAwbPrintVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  codValue: number;

  @ApiModelPropertyOptional()
  provider: string;
}

export class WebCodPrintMetaVm {
  @ApiModelProperty()
  transactionCode: string;

  @ApiModelProperty()
  transactionDate: string;

  @ApiModelProperty()
  transactionTime: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  adminName: string;

  @ApiModelProperty()
  nikAdmin: string;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  nikDriver: string;

  @ApiModelProperty()
  totalItems: number;

  @ApiModelProperty()
  totalCodValue: number;
}

export class PrintCodTransferBranchVm {
  @ApiModelProperty({ type: () => WebCodPrintMetaVm })
  meta: WebCodPrintMetaVm;

  @ApiModelProperty({ type: () => [WebCodAwbPrintVm] })
  data: WebCodAwbPrintVm[];
}
// #endregion for data printing

export class WebCodVoucherSuccessResponseVm {
  @ApiModelProperty()
  responseCode: string;

  @ApiModelProperty()
  responseMessage: string;

  @ApiModelProperty()
  dataError: string[];
}

export class WebCodCountResponseVm {
  @ApiModelProperty()
  total: number;
}

export class WebInsertCodPaymentResponseVm extends WebCodSuccessResponseVm {}

export class WebMonitoringSettlementResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebMonitoringSettlementVm] })
  data: WebMonitoringSettlementVm[];
}

export class WebMonitoringSettlementVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  codVoucherNo: string;

  @ApiModelProperty({ format: 'date-time' })
  codVoucherDate: string;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  statusPayment: string;

  @ApiModelProperty()
  transactionStatus: string;
}

export class WebAwbCodSummaryResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodSummaryResponseVm] })
  data: WebItemAwbCodSummaryResponseVm[];
}

export class WebItemAwbCodSummaryResponseVm {
  @ApiModelProperty()
  perwakilan: string;

  @ApiModelProperty()
  branchIdFinal: number;

  @ApiModelProperty()
  branchNameFinal: string;

  @ApiModelProperty()
  priceCod: number;

  @ApiModelProperty()
  countAwb: number;
}
export class WebCodNominalUpdateResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  status: boolean;
}

export class WebCodPaymentDeleteResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  status: boolean;
}

export class WebCodNominalCheckResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  status: boolean;
}

export class WebItemUpdateNominalCodResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  requestorId: number;

  @ApiModelProperty()
  requestorName: string;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  codValueCurrent: number;

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  attachmentUrl: string;

  @ApiModelProperty({ format: 'date-time' })
  updateDate: string;
}

export class WebUpdateNominalCodListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemUpdateNominalCodResponseVm] })
  data: WebItemUpdateNominalCodResponseVm[];
}
