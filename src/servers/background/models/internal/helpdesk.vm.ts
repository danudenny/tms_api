import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class HelpdeskPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  claimInvoiceDate: Date;

  @ApiModelProperty()
  claimInvoiceCode: string;

  @ApiModelProperty()
  claimSpecialCase: string;

  @ApiModelProperty()
  claimTermType: string;

  @ApiModelProperty()
  claimPaymentDate: Date;

}

export class HelpdeskResponseVM {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [HelpdeskVm]})
  data: HelpdeskVm[];
}

export class HelpdeskVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  claimInvoiceDate: Date;

  @ApiModelProperty()
  claimInvoiceCode: string;

  @ApiModelProperty()
  claimSpecialCase: string;

  @ApiModelProperty()
  claimTermType: string;

  @ApiModelProperty()
  claimPaymentDate: Date;

  @ApiModelProperty()
  claimnSlaPayment: number;

}
