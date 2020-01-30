import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';

// Create DO DO RETURN SURAT JALAN CT to Collection
export class DoReturnDeliveryOrderCtCreateVm {
   @ApiModelProperty()
   countAwb: number;

   @ApiModelProperty()
   doReturnAwbId: string[];

}

export class DoReturnDeliveryOrderCustCreateVm {
  @ApiModelProperty()
  countAwb: number;

  @ApiModelProperty()
  doReturnAwbId: string[];

}
