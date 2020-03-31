import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DropCashlessVm {
  @ApiModelProperty()
  awb_number: string;

  @ApiModelProperty()
  branch_code: string;

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
}
