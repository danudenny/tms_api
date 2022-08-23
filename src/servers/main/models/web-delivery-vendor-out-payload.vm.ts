import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { Type } from 'class-transformer';

export class WebDeliveryVendorOutPayload {
  @ApiModelProperty()
  @Type(() => String)
  scanValue: string[];
}

export class WebDeliveryVendorOutSendPayload {
  @ApiModelProperty()
  vendor_id: string;

  @ApiModelProperty()
  order_vendor_code: string;

  @ApiModelProperty()
  @Type(() => String)
  scanValue: string[];
}