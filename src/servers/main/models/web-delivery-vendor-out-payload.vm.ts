import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { Type } from 'class-transformer';

export class WebDeliveryVendorOutPayload {
  @ApiModelProperty()
  @Type(() => String)
  awbNumber: string[];
}

export class WebDeliveryVendorOutSendPayload {
  @ApiModelProperty()
  vendor_id: string;


  @ApiModelProperty()
  @Type(() => String)
  awbNumber: string[];
}