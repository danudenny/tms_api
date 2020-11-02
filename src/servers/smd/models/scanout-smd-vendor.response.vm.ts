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

export class ScanOutSmdVendorItemMoreResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({type: () => [ScanOutVendorItemMoreDataVm]})
  data: ScanOutVendorItemMoreDataVm[];
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

export class ScanOutVendorItemMoreDataVm extends ScanOutSmdVendorItemResponseVm {
  @ApiModelProperty()
  item_number: string;
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

export class ScanOutSmdVendorListDetailResponseVm {
  @ApiModelProperty()
  vendor_id: number;

  @ApiModelProperty()
  vendor_name: string;

  @ApiModelProperty()
  vendor_code: string;

  @ApiModelProperty()
  do_smd_id: string;

  @ApiModelProperty()
  do_smd_detail_id: string;

  @ApiModelProperty()
  branch_name: string;

  @ApiModelProperty()
  branch_id: string;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_time: string;

  @ApiModelProperty()
  total_bag: string;

  @ApiModelProperty()
  total_bagging: string;

  @ApiModelProperty()
  total_bag_representative: string;
}

export class ScanOutSmdVendorListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ScanOutSmdVendorListDetailResponseVm] })
  data: ScanOutSmdVendorListDetailResponseVm[];
}

export class ScanOutSmdDetailVendorResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailVendorVm]})
  data: ScanOutDetailVendorVm[];
}

export class ScanOutDetailVendorVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_number: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representative_code: string;

  @ApiModelProperty()
  branch_name: string;

}

export class ScanOutSmdDetailBaggingVendorResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailBaggingVendorVm]})
  data: ScanOutDetailBaggingVendorVm[];
}

export class ScanOutDetailBaggingVendorVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bagging_number: string;

  @ApiModelProperty()
  total_bag: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representative_code: string;

  @ApiModelProperty()
  branch_name: string;

}

export class ScanOutSmdDetailBagRepresentativeVendorResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailBagRepresentativeVendorVm]})
  data: ScanOutDetailBagRepresentativeVendorVm[];
}

export class ScanOutDetailBagRepresentativeVendorVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_representative_code: string;

  @ApiModelProperty()
  total_awb: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representative_code: string;

  @ApiModelProperty()
  branch_name: string;

}

export class ScanOutVendorHistoryResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanOutVendorHistoryVm] })
  data: ScanOutVendorHistoryVm[];
}

export class ScanOutVendorHistoryVm {
  @ApiModelProperty()
  do_smd_history_id: number;

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: number;

  @ApiModelProperty()
  history_date: Date;

  @ApiModelProperty()
  do_smd_status_id: number;

  @ApiModelProperty()
  history_status: String;

  @ApiModelProperty()
  username: String;

  @ApiModelProperty()
  assigne: String;

  @ApiModelProperty()
  vendor_name: String;

}

export class ScanOutVendorReportVm {
  @ApiModelProperty()
  id: string;
}
