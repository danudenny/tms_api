import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class CheckDataDropPartnerVm {
  @ApiModelProperty()
  awb_number: string;
}

export class DropCashlessVm {
  @ApiModelProperty()
  awb_number: string;

  @ApiModelProperty()
  branch_code: string;

}

export class DropSuccessResponseVm {
  @ApiModelProperty({example: 'Drop Success'})
  message: string;

  @ApiModelProperty({example: 200})
  statusCode: number;

}

export class DropCashLessResponseVM {
  @ApiModelProperty()
  partner: string;

  @ApiModelProperty()
  ref_no: string;

  @ApiModelProperty()
  ref_awb_number: string;

  @ApiModelProperty()
  recipient_city: string;

  @ApiModelProperty()
  delivery_type: string;

  @ApiModelProperty()
  shipper_name: string;

  @ApiModelProperty()
  shipper_address: string;

  @ApiModelProperty()
  shipper_district: string;

  @ApiModelProperty()
  shipper_city: string;

  @ApiModelProperty()
  shipper_province: string;

  @ApiModelProperty()
  shipper_zip: string;

  @ApiModelProperty()
  shipper_phone: string;

  @ApiModelProperty()
  recipient_name: string;

  @ApiModelProperty()
  recipient_address: string;

  @ApiModelProperty()
  recipient_district: string;

  @ApiModelProperty()
  recipient_province: string;

  @ApiModelProperty()
  recipient_zip: string;

  @ApiModelProperty()
  recipient_phone: string;

  @ApiModelProperty()
  pickup_processed: boolean;
}

export class DropPickupRequestResponseVM {
  @ApiModelProperty()
  partner: string;

  @ApiModelProperty()
  refNo: string;

  @ApiModelProperty()
  pickupRequestId: number;

  @ApiModelProperty()
  pickupRequestDetailId: number;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  refAwbNumber: string;

  @ApiModelProperty()
  deliveryType: string;

  @ApiModelProperty()
  shipperName: string;

  @ApiModelProperty()
  shipperAddress: string;

  @ApiModelProperty()
  shipperDistrict: string;

  @ApiModelProperty()
  shipperCity: string;

  @ApiModelProperty()
  shipperProvince: string;

  @ApiModelProperty()
  shipperZip: string;

  @ApiModelProperty()
  shipperPhone: string;

  @ApiModelProperty()
  recipientName: string;

  @ApiModelProperty()
  recipientAddress: string;

  @ApiModelProperty()
  recipientDistrict: string;

  @ApiModelProperty()
  recipientCity: string;

  @ApiModelProperty()
  recipientProvince: string;
  @ApiModelProperty()
  recipientZip: string;

  @ApiModelProperty()
  recipientPhone: string;

  @ApiModelProperty()
  workOrderIdLast: number;

  @ApiModelProperty()
  pickupRequestName: string;

  @ApiModelProperty()
  pickupRequestAddress: string;

  @ApiModelProperty()
  encryptAddress255: string;

  @ApiModelProperty()
  encryptMerchantName: string;

  @ApiModelProperty()
  pickupPhone: string;

  @ApiModelProperty()
  pickupEmail: string;

  @ApiModelProperty()
  pickupNotes: string;

  @ApiModelProperty()
  parcelValue: number;

  @ApiModelProperty()
  pickupRequestStatus: number;

  @ApiModelProperty()
  pickupProcessed: boolean;

  @ApiModelProperty()
  pickupRequestType: string;
}

export class DropCreateWorkOrderPayloadVM {
  @ApiModelProperty()
  branchPartnerId: number;

  @ApiModelProperty()
  pickupAddress: string;

  @ApiModelProperty()
  encryptAddress255: string;

  @ApiModelProperty()
  merchantName: string;

  @ApiModelProperty()
  encryptMerchantName: string;

  @ApiModelProperty()
  pickupPhone: string;

  @ApiModelProperty()
  pickupEmail: string;

  @ApiModelProperty()
  pickupNotes: string;

  @ApiModelProperty()
  totalAwbQty: number;

  @ApiModelProperty()
  partnerIdAssigned: number;
}

export class ListSuccessResponseVm {
  @ApiModelProperty({example: 'List Success'})
  message: string;

  @ApiModelProperty({example: 200})
  status_code: number;

  @ApiModelProperty({type: () => [ListDataVm]})
  data: ListDataVm[];
}

export class ListDataVm {

  @ApiModelProperty()
  branch_sicepat_code: string;

  @ApiModelProperty()
  branch_sicepat_name: string;

  @ApiModelProperty()
  branch_partner_code: string;

  @ApiModelProperty()
  branch_partner_name: string;

  @ApiModelProperty({type: () => [ChildVm]})
  branch_child: ChildVm[];

}
export class ChildVm {

  @ApiModelProperty()
  branch_child_partner_code: string;

  @ApiModelProperty()
  branch_child_partner_name: string;

}
