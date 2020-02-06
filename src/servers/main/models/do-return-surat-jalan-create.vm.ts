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
// update surat jalan

export class DoReturnUpdate {
  @ApiModelPropertyOptional()
  isPartnerLogistic: number;

  @ApiModelPropertyOptional()
  partnerLogisticId: string;

  @ApiModelPropertyOptional()
  awbNumberNew: string;

  @ApiModelPropertyOptional()
  doReturnAdminToCtId: string;
}
