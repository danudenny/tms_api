import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

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
  item_number: string;

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
