import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';

export class WebCodAwbPayloadVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  paymentMethod: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  codValue: number;

  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty({ format: 'date-time' })
  manifestedDate: string;

  @ApiModelPropertyOptional()
  paymentService: string;

  @ApiModelPropertyOptional()
  noReference: string;

}

export class WebCodTransferPayloadVm {
  @ApiModelPropertyOptional( { type: () => [WebCodAwbPayloadVm]})
  dataCash: [WebCodAwbPayloadVm];

  @ApiModelPropertyOptional( { type: () => [WebCodAwbPayloadVm]})
  dataCashless: [WebCodAwbPayloadVm];
}

export class WebCodTransferHeadOfficePayloadVm {
  @ApiModelProperty()
  dataTransactionId: string[];

  @ApiModelProperty()
  bankBranchId: number;
}

export class WebCodBankStatementValidatePayloadVm {
  @ApiModelProperty()
  bankStatementId: string;

  @ApiModelProperty()
  bankNoReference: string;
}

export class WebCodBankStatementCancelPayloadVm {
  @ApiModelProperty()
  bankStatementId: string;
}

export class AwbSupplierInvoice {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  codValue: number;
}

export class WebCodSupplierInvoicePayloadVm {
  @ApiModelProperty({ type: () => [AwbSupplierInvoice] })
  data: [AwbSupplierInvoice];
}

export class WebCodFirstTransactionPayloadVm {
  awbItemId: number;
  awbNumber: string;
  codTransactionId: string;
  transactionStatusId: number;
  supplierInvoiceStatusId: number;
  codSupplierInvoiceId: string;

  paymentMethod: string;
  paymentService: string;
  noReference: string;
  branchId: number;
  userId: number;
  userIdDriver: number;
}

// #region Supplier Invoice
export class WebCodInvoiceValidatePayloadVm {
  @ApiModelProperty()
  partnerId: number;
}

export class WebCodInvoiceDraftPayloadVm {
  @ApiModelProperty()
  supplierInvoiceId: string;
}

// #endregion
