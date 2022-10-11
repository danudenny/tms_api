import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebDeliveryVendorOutResponse {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  awbNumber: string;
}

export class WebDeliveryVendorOutResponseVm {
  @ApiModelProperty({ type: () => [WebDeliveryVendorOutResponse] })
  data: WebDeliveryVendorOutResponse[];
}

export class ScanOutPropertyAwbResponse {
  @ApiModelProperty()
  awbNumber : string;


  @ApiModelProperty()
  status : string;


  @ApiModelProperty()
  message : string;


  @ApiModelProperty()
  reference_no : string;


  @ApiModelProperty()
  pickup_name : string;


  @ApiModelProperty()
  pickup_address : string;


  @ApiModelProperty()
  pickup_phone : string;


  @ApiModelProperty()
  pickup_place : number;


  @ApiModelProperty()
  pickup_email : string;


  @ApiModelProperty()
  pickup_postal_code : number;


  @ApiModelProperty()
  pickup_contact : string;


  @ApiModelProperty()
  pickup_latitude : string;


  @ApiModelProperty()
  pickup_longitude : string;


  @ApiModelProperty()
  pickup_district_code: string;
  

  @ApiModelProperty()
  pickup_district_id : number;


  @ApiModelProperty()
  service_type_code : string;


  @ApiModelProperty()
  quantity : number;


  @ApiModelProperty()
  total_item : number;


  @ApiModelProperty()
  weight : number;


  @ApiModelProperty()
  volumetric : string;


  @ApiModelProperty()
  shipment_type_code : string;


  @ApiModelProperty()
  shipment_content_code : string;


  @ApiModelProperty()
  description_item : string;


  @ApiModelProperty()
  item_value : number;


  @ApiModelProperty()
  insurance_flag : number;


  @ApiModelProperty()
  insurance_type_code : string;


  @ApiModelProperty()
  insurance_value : number;


  @ApiModelProperty()
  cod_flag : number;


  @ApiModelProperty()
  cod_value : number;


  @ApiModelProperty()
  shipper_name : string;


  @ApiModelProperty()
  shipper_address : string;


  @ApiModelProperty()
  shipper_phone : string;


  @ApiModelProperty()
  shipper_email : string;


  @ApiModelProperty()
  shipper_postal_code : number;


  @ApiModelProperty()
  shipper_contact : string;


  @ApiModelProperty()
  destination_district_code : string;

  @ApiModelProperty()
  destination_district_id : number;


  @ApiModelProperty()
  receiver_name : string;


  @ApiModelProperty()
  receiver_address : string;


  @ApiModelProperty()
  receiver_latitude : string;


  @ApiModelProperty()
  receiver_longitude : string;


  @ApiModelProperty()
  receiver_phone : string;


  @ApiModelProperty()
  receiver_email : string;


  @ApiModelProperty()
  receiver_postal_code : number;


  @ApiModelProperty()
  receiver_contact : string;


  @ApiModelProperty()
  special_instruction : string;


  @ApiModelProperty()
  return_district_code : string;


  @ApiModelProperty()
  return_phone : string;


  @ApiModelProperty()
  return_contact : string;


  @ApiModelProperty()
  return_address : string;

  @ApiModelProperty()
  origin_id : string;

  @ApiModelProperty()
  pickup_city : string;

  @ApiModelProperty()
  shipper_city : string;

  @ApiModelProperty()
  shipper_province : string;

  @ApiModelProperty()
  receiver_city : string;

  @ApiModelProperty()
  receiver_province : string;
}

export class ScanOutPropertyAwbResponseVm {
  @ApiModelProperty({ type: () => [ScanOutPropertyAwbResponse] })
  data: ScanOutPropertyAwbResponse[];
}

export class WebDeliveryTrackingVendorResponse{
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  awbNumber: string;
}

export class WebDeliveryTrackingVendorResponseVm {
  @ApiModelProperty({ type: () => [WebDeliveryTrackingVendorResponse] })
  data: WebDeliveryTrackingVendorResponse[];
}