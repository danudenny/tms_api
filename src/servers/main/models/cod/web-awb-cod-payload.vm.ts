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
  bankAccountId: string;
}
