import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class DoReturnHistory {
  @ApiModelProperty()
   createdDate: string;

   @ApiModelProperty()
   status: string;

   @ApiModelProperty()
   doCode: string;

   @ApiModelProperty()
   userCreated: string;
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
