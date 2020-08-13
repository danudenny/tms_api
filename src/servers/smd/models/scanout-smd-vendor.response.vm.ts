import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanOutSmdVendorRouteResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutVendorRouteVm]})
  data: ScanOutVendorRouteVm[];
}

export class ScanOutVendorRouteVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  vendor_name: string;

  @ApiModelProperty()
  representative_code_list: string;

  @ApiModelProperty()
  departure_schedule_date_time: Date;

}

export class ScanOutSmdVendorItemResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutVendorItemVm]})
  data: ScanOutVendorItemVm[];
}

export class ScanOutVendorItemVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bagging_id: number;

  @ApiModelProperty()
  bag_id: number;

  @ApiModelProperty()
  bag_item_id: number;

  @ApiModelProperty()
  bag_representative_id: number;

  @ApiModelProperty()
  bag_type: number;

  @ApiModelProperty()
  bag_number: string;

  @ApiModelProperty()
  bagging_number: string;

  @ApiModelProperty()
  bag_representative_code: string;

  @ApiModelProperty()
  total_bag: number;

  @ApiModelProperty()
  total_bagging: number;

  @ApiModelProperty()
  total_bag_representative: number;

}

export class ScanOutSmdVendorEndResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutVendorEndVm]})
  data: ScanOutVendorEndVm[];
}

export class ScanOutVendorEndVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  vendor_name: string;

}
