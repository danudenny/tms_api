import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class ScanOutSmdVehiclePayloadVm {
  @ApiModelProperty()
  employee_id_driver: number;

  @ApiModelProperty()
  smd_date: Date;

  @ApiModelProperty()
  vehicle_number: string;

}

export class ScanOutSmdRoutePayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  branch_code: string;

  @ApiModelProperty()
  representative_code: string;

}

export class ScanOutSmdItemPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  item_number: string[];

}

export class ScanOutSmdSealPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  seal_number: string;

  @ApiModelProperty()
  seal_seq: string;

}

export class ScanOutSmdHandoverPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  employee_id_driver: number;

  @ApiModelProperty()
  vehicle_number: string;

}

export class ScanOutSmdDetailRepresentativePayloadVm {
  @ApiModelProperty()
  do_smd_id: number;
}

export class ScanOutSmdDetailPayloadVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_type: number;

}

export class ScanOutSmdDetailMorePayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_type: number;
}

export class ScanOutSmdImagePayloadVm {
  @ApiModelProperty()
  do_smd_history_id: number;

  @ApiModelProperty()
  do_smd_status_id: number;
}

export class StoreExcelScanOutPayloadVm extends BaseMetaPayloadVm {
  @ApiModelPropertyOptional()
  user_id: string;

  @ApiModelPropertyOptional()
  baranch_id: string;

  @ApiModelProperty()
  id: string;
}
