import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

// Create DO DO RETURN
export class DoReturnCreateVm {
  @ApiModelProperty()
   awbNumber: string;

   @ApiModelProperty()
   doReturnNo: string;

   @ApiModelProperty()
   customerId: number;

   @ApiModelProperty()
   podDatetime: string;

   @ApiModelProperty()
   branchIdLast: number;

   @ApiModelProperty()
   lastStatusAwb: number;

}
export class ReturnCreateVm {
  @ApiModelProperty({ type: () => [DoReturnCreateVm] })
  data: DoReturnCreateVm[];
}
