import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class ScanOutSmdVendorRoutePayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  vendor_id: number;

  @ApiModelProperty()
  vendor_name: string;

  @ApiModelProperty()
  representative_code: string;

}

export class ScanOutSmdVendorItemPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  item_number: string;

}
