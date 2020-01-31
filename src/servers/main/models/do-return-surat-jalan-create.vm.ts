import { ApiModelProperty, ApiModelPropertyOptional} from '../../../shared/external/nestjs-swagger';
import { bool } from 'aws-sdk/clients/signer';

// Create DO DO RETURN SURAT JALAN
export class DoReturnDeliveryOrderCreateVm {
  @ApiModelProperty()
   isPartnerLogistic: boolean;

   @ApiModelPropertyOptional()
   partnerLogisticId: string;

   @ApiModelProperty()
   countAwb: number;

   @ApiModelProperty()
   awbNumberNew: string;

   @ApiModelProperty()
   doReturnAwbId: string[];

}
