import { ApiModelProperty, ApiModelPropertyOptional} from '../../../shared/external/nestjs-swagger';
import { bool } from 'aws-sdk/clients/signer';

// Create DO DO RETURN SURAT JALAN
export class DoReturnDeliveryOrderCreateVm {
  @ApiModelPropertyOptional()
   isPartnerLogistic: bool;

   @ApiModelPropertyOptional()
   partnerLogisticId: string;

   @ApiModelProperty()
   countAwb: number;

   @ApiModelPropertyOptional()
   awbNumberNew: string;

   @ApiModelProperty()
   doReturnAwbId: string[];

}
// update surat jalan

export class DoReturnUpdate {
  @ApiModelPropertyOptional()
  isPartnerLogistic: bool;

  @ApiModelPropertyOptional()
  partnerLogisticId: string;

  @ApiModelPropertyOptional()
  awbNumberNew: string;

  @ApiModelPropertyOptional()
  doReturnAdminToCtId: string;
}
