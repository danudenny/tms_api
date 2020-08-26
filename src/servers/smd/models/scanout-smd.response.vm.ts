import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanOutSmdVehicleResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutVehicleVm]})
  data: ScanOutVehicleVm[];
}

export class ScanOutVehicleVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_vehicle_id: number;

  @ApiModelProperty()
  departure_schedule_date_time: Date;

}

export class ScanOutSmdRouteResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutRouteVm]})
  data: ScanOutRouteVm[];
}

export class ScanOutRouteVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  branch_name: string;

  @ApiModelProperty()
  representative_code_list: string;

}

export class ScanOutSmdItemResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutItemVm]})
  data: ScanOutItemVm[];
}

export class ScanOutItemVm {

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

export class ScanOutSmdSealResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutSealVm]})
  data: ScanOutSealVm[];
}

export class ScanOutSealVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  seal_number: string;

}

export class ScanOutListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanOutListVm] })
  data: ScanOutListVm[];
}

export class ScanOutListVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_time: Date;

  @ApiModelProperty()
  fullname: string;

  @ApiModelProperty()
  employee_id: number;

  @ApiModelProperty()
  vehicle_number: string;

  @ApiModelProperty()
  branch_from_name: string;

  @ApiModelProperty()
  branch_to_name: string;

  @ApiModelProperty()
  total_bag: number;

  @ApiModelProperty()
  total_bagging: number;

  @ApiModelProperty()
  total_bag_representative: number;

  @ApiModelProperty()
  do_smd_status_title: string;
}

export class ScanOutHistoryResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanOutHistoryVm] })
  data: ScanOutHistoryVm[];
}

export class ScanOutHistoryVm {
  @ApiModelProperty()
  do_smd_history_id: number;

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: number;

  @ApiModelProperty()
  branch_from_name: string;

  @ApiModelProperty()
  branch_to_name: string;

  @ApiModelProperty()
  history_date: Date;

  @ApiModelProperty()
  do_smd_status_id: number;

  @ApiModelProperty()
  history_status: String;

  @ApiModelProperty()
  seal_number: String;

  @ApiModelProperty()
  photo_url: String;

  @ApiModelProperty()
  username: String;

  @ApiModelProperty()
  assigne: String;

  @ApiModelProperty()
  branch_name: String;

  @ApiModelProperty()
  reason_notes: String;
}

export class ScanOutSmdHandoverResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutHandoverVm]})
  data: ScanOutHandoverVm[];
}

export class ScanOutHandoverVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_vehicle_id: number;

}

export class ScanOutSmdDetailRepresentativeResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailRepresentativeVm]})
  data: ScanOutDetailRepresentativeVm[];
}

export class ScanOutDetailRepresentativeVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  branch_name: string;

}

export class ScanOutSmdDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailVm]})
  data: ScanOutDetailVm[];
}

export class ScanOutDetailVm {

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

export class ScanOutSmdDetailBaggingResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailBaggingVm]})
  data: ScanOutDetailBaggingVm[];
}

export class ScanOutDetailBaggingVm {

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

export class ScanOutSmdDetailBagRepresentativeResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDetailBagRepresentativeVm]})
  data: ScanOutDetailBagRepresentativeVm[];
}

export class ScanOutDetailBagRepresentativeVm {

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

export class ScanOutDetailMoreResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanOutDetailMoreVm] })
  data: ScanOutDetailMoreVm[];
}

export class ScanOutDetailMoreVm {
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

export class ScanOutDetailBaggingMoreResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanOutDetailBaggingMoreVm] })
  data: ScanOutDetailBaggingMoreVm[];
}

export class ScanOutDetailBaggingMoreVm {

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

export class ScanOutDetailBagRepresentativeMoreResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanOutDetailBagRepresentativeMoreVm] })
  data: ScanOutDetailBagRepresentativeMoreVm[];
}

export class ScanOutDetailBagRepresentativeMoreVm {

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

export class ScanOutSmdImageResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutImageVm]})
  data: ScanOutImageVm[];
}

export class ScanOutImageVm {

  @ApiModelProperty()
  do_smd_detail_attachment_id: number;

  @ApiModelProperty()
  image_url: string;

  @ApiModelProperty()
  image_type: string;
}

export class ScanOutSmdEditResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutEditVm]})
  data: ScanOutEditVm[];
}

export class ScanOutEditVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  branch_id_from: number;

  @ApiModelProperty()
  branch_code_from: string;

  @ApiModelProperty()
  branch_name_from: string;

  @ApiModelProperty()
  branch_id_to: number;

  @ApiModelProperty()
  branch_code: string;

  @ApiModelProperty()
  branch_name: string;

  @ApiModelProperty()
  representative_code_list: string;

}

export class ScanOutSmdEditDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutEditDetailVm]})
  data: ScanOutEditDetailVm[];
}

export class ScanOutEditDetailVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_number: string;

  @ApiModelProperty()
  bag_type: number;

}
