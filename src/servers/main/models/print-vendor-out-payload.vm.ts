import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintVendorOutPayloadQueryVm {
  @ApiModelProperty()
  orderVendorCode: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;
}