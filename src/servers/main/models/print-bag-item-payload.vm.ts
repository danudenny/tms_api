import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintBagItemPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;
}

export class PrintAwbPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  is_partner_logistic: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;
}
