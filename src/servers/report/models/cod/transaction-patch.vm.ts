import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class TransactionPatchPayloadVm {
  @ApiModelProperty()
  data: string[];
}

export class TransactionPatchSuccessResponseVm {
  @ApiModelProperty()
  errors: string[];

  @ApiModelProperty({ example: 'Update Status Success' })
  message: string;

  @ApiModelProperty({ example: 200 })
  status: number;
}
