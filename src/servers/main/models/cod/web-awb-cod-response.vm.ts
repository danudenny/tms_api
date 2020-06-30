import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

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
  representativeId: number;

  @ApiModelProperty()
  awbStatusIdLast: string;

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
}

export class WebAwbCodListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebItemAwbCodResponseVm] })
  data: WebItemAwbCodResponseVm[];
}

export class WebTransactionBranchDetail {
  @ApiModelProperty()
  transactionId: string;

  @ApiModelProperty()
  transactionCode: string;

  @ApiModelProperty({ format: 'date-time' })
  transactionDate: string;

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
  adminName: string;
}

export class WebAwbCodListTransactionResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebTransactionBranchDetail] })
  data: WebTransactionBranchDetail[];
}

export class WebCodBankStatementVm {
  @ApiModelProperty()
  bankStatementId: string;

  @ApiModelProperty()
  bankStatementCode: string;

  @ApiModelProperty({ format: 'date-time' })
  bankStatementDate: string;

  @ApiModelProperty()
  transactionStatusId: number;

  @ApiModelProperty()
  bankAccount: string;

  @ApiModelProperty()
  transactionStatus: string;

  @ApiModelProperty()
  totalTransaction: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  adminName: string;
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

export class CodTransactionDetail {
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
  @ApiModelProperty({ type: () => [CodTransactionDetail] })
  data: CodTransactionDetail[];
}

export class WebCodTransferHeadOfficeResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  dataError: string[];
}

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
  employeeIdDriver: number;

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
