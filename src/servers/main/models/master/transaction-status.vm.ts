import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class TransactionStatusVm {
  @ApiModelProperty()
  transactionStatusId: number;

  @ApiModelProperty()
  statusCategory: string;

  @ApiModelProperty()
  statusCode: string;

  @ApiModelProperty()
  statusTitle: string;

  @ApiModelProperty()
  statusName: string;

  @ApiModelProperty()
  statusLevel: number;
}

// response
export class TransactionStatusResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [TransactionStatusVm] })
  data: TransactionStatusVm[];
}
