import { double } from 'aws-sdk/clients/lightsail';
import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DeteleTaxPayloadVm {
  @ApiModelProperty()
  ref_awb_number: string;
}

export class DeleteTaxResponseVM {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [DeleteTaxVm]})
  data: DeleteTaxVm[];
}

export class DeleteTaxVm {

  @ApiModelProperty()
  ref_awb_number: string;

  @ApiModelProperty()
  is_deleted: boolean;
}

export class UpdateTaxPayloadVm {
  @ApiModelProperty()
  ref_awb_number: string;

  @ApiModelProperty()
  item_price: number;
}

export class UpdateTaxResponseVM {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [UpdateTaxVm]})
  data: UpdateTaxVm[];
}

export class UpdateTaxVm {

  @ApiModelProperty()
  ref_awb_number: string;

  @ApiModelProperty()
  import_duty_fee: double;

  @ApiModelProperty()
  ppn_fee: double;

  @ApiModelProperty()
  pph_fee: double;

  @ApiModelProperty()
  total_fee: double;
}
