import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class BankAccountVm {
  @ApiModelProperty()
  bankBranchId: number;

  @ApiModelProperty()
  bankBranchName: string;

  @ApiModelProperty()
  accountNumber: string;

  @ApiModelProperty()
  address: string;

  @ApiModelProperty()
  bankCode: string;

  @ApiModelProperty()
  bankName: string;
}

// response
export class BankAccountResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [BankAccountVm] })
  data: BankAccountVm[];
}
