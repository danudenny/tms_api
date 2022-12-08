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
  notes : string;

  @ApiModelProperty()
  branch_id : number;

  @ApiModelProperty()
  @Type(() => String)
  scanValue: string[];
}

export class ScanOutPropertyAwbPayloadVm {
  @ApiModelProperty()
  branch_id: number;

  @ApiModelProperty()
  user_id: number;
  
  @ApiModelProperty()
  awbNumber: string[];
}

export class WebDeliveryTrackingVendorPayload {
  @ApiModelProperty({ type: () => [WebDeliveryTrackingVendor] })
  scanValue: WebDeliveryTrackingVendor[];
}

export class WebDeliveryTrackingVendor{
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  noteInternal : string;

  @ApiModelProperty()
  notePublic : string;

  @ApiModelProperty()
  latitude : string;

  @ApiModelProperty()
  longitude : string;

  @ApiModelProperty()
  branchId : number;

  @ApiModelProperty()
  userId : number;

  @ApiModelProperty()
  urlPhoto : string;

  @ApiModelProperty()
  urlPhotoSignature : string;

  @ApiModelProperty()
  urlPhotoRetur : string;
}