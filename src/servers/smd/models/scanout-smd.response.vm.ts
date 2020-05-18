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

export class ScanInSmdBaggingResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInBaggingVm]})
  data: ScanInBaggingVm[];
}

export class ScanInBaggingVm {
  @ApiModelProperty({type: () => [ScanInBagNotScannedVm]})
  data_bag: ScanInBagNotScannedVm[];

  @ApiModelProperty({type: () => [ScanInBagScannedVm]})
  data_bag_scanned: ScanInBagScannedVm[];

}

export class ScanInBagScannedVm {
  @ApiModelProperty()
  bagnumber: string;

}

export class ScanInBagNotScannedVm {
  @ApiModelProperty()
  bagnumber: string;

}

export class ScanInListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanInListVm] })
  data: ScanInListVm[];
  // @ApiModelProperty({ type: () => [ScanInListVm] })
  // data: ScanInListVm[];
}

export class ScanInListVm {
  @ApiModelProperty()
  bag_id: number;

  @ApiModelProperty()
  bag_number_seq: string;

  @ApiModelProperty()
  branch_name: string;

  @ApiModelProperty()
  bagging_datetime: string;

  @ApiModelProperty()
  scan_in_datetime: string;

  @ApiModelProperty()
  representative_name: string;

  @ApiModelProperty()
  tot_resi: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  weight_accumulative: number;
}

