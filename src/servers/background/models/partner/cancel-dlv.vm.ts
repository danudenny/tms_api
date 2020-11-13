import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class CancelDeliverPayloadVm {
  // receipt_number
  @ApiModelProperty({ example: '000000000XXX' })
  awb_number: string;

  @ApiModelProperty({ example: '5F4ABCF74FA3452B8B81BF3508892D1E' })
  auth_key: string;
}

export class CancelDeliverOkResponseVm {
  @ApiModelProperty({ example: 'success' })
  status: string;

  // receipt_number
  @ApiModelProperty({ example: '000000000XXX' })
  awb_number: string;

  @ApiModelProperty({ example: 'awb_number: 000000000XXX sudah di cancel.' })
  message: string;
}

export class CancelDeliverFailedResponseVm {
  @ApiModelProperty({ example: 'failed' })
  status: string;

  // receipt_number
  @ApiModelProperty({ example: '000000000XXX' })
  awb_number: string;

  @ApiModelProperty({ example: 'awb_number: 000000000XXX tidak ditemukan.' })
  message: string;
}
