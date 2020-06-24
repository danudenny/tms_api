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

  @ApiModelPropertyOptional()
  codPaymentService: string;

  // @ApiModelProperty()
  // branchIdLast: number;
}

export class WebCodTransferPayloadVm {
  @ApiModelProperty( { type: () => [WebCodAwbPayloadVm]})
  dataCash: [WebCodAwbPayloadVm];

  @ApiModelPropertyOptional( { type: () => [WebCodAwbPayloadVm]})
  dataCashless: [WebCodAwbPayloadVm];
}
