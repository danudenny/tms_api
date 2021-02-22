import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class MobileCodEReceiptPayloadVm {
  @ApiModelProperty({ example: 'Ade Farizal'})
  courier_name: string;

  @ApiModelProperty({ example: '000357421867'})
  awb: string;

  @ApiModelProperty({ example: 'Moh.bardi'})
  recipient_name: string;

  @ApiModelProperty({ example: 'Patemon, RT 122, RW 23, Kec Sapeken'})
  recipient_address: string;

  @ApiModelProperty({ example: '1164000'})
  cod_value: number;

  @ApiModelProperty({ example: 'cash'})
  cod_type: string;
}

export class MobileCodEReceiptResponseVm {
  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  trxid: string;

  @ApiModelProperty()
  amount: string;

  @ApiModelProperty()
  filename: string;

  @ApiModelProperty()
  time_finished: string;

  @ApiModelProperty()
  redirec_link: string;
}

export class MobileCodPaymentStatusPayloadVm {
  @ApiModelProperty({ example: '000472344125' })
  awb: string;
  @ApiModelProperty({ example: 'apps' })
  source: string;
  @ApiModelProperty({ example: 'SCPT16116376006683' })
  trxid: string;
}
