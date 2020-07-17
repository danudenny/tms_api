import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';
import { IsAwbNumber } from '../../../../shared/decorators/custom-validation.decorator';
import { IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

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
  @ApiModelProperty()
  userIdDriver: number;

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

  // @ApiModelProperty()
  // totalAwb: number;
}

export class WebCodInvoiceAddAwbPayloadVm {
  @ApiModelProperty({
    example: ['000726556611', '000726556612'],
    skipValidation: true,
  })
  @IsDefined({message: 'No Resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];

  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  supplierInvoiceId: string;
}

export class WebCodInvoiceRemoveAwbPayloadVm {
  @ApiModelProperty({
    example: ['000726556611', '000726556612'],
    skipValidation: true,
  })
  @IsDefined({message: 'No Resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];

  @ApiModelProperty()
  supplierInvoiceId: string;
}
// #endregion
