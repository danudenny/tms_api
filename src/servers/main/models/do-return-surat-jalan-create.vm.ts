import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';
import { bool } from 'aws-sdk/clients/signer';

// Create DO DO RETURN SURAT JALAN
export class DoReturnDeliveryOrderCreateVm {
  @ApiModelProperty()
   isPartnerLogistic: bool;

   @ApiModelProperty()
   partnerLogisticId: number;

   @ApiModelProperty()
   countAwb: number;

   @ApiModelProperty()
   attachmentId: number;

   @ApiModelProperty()
   awbNumberNew: string;

   @ApiModelProperty()
   doReturnAwbId: string[];

}
