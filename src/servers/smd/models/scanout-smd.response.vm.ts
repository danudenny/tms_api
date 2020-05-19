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
  bag_type: number;

  // @ApiModelProperty()
  // branch_name: string;

  // @ApiModelProperty()
  // representative_code_list: string;

  @ApiModelProperty()
  total_bag: number;

  @ApiModelProperty()
  total_bagging: number;

}
