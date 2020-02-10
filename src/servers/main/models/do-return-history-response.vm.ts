import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class DoReturnHistory {
  @ApiModelProperty()
   dateTime: string;

   @ApiModelProperty()
   status: string;

   @ApiModelProperty()
   doCode: string;

   @ApiModelProperty()
   userName: string;

   @ApiModelProperty()
   employeeNik: string;
}
export class ReturnHistoryResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbNumberNew: string;

  @ApiModelProperty()
  doReturnNumber: string;

  @ApiModelProperty()
  customerName: string;

  @ApiModelProperty({ type: () => [DoReturnHistory] })
  data: DoReturnHistory[];
}
