import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class ScanOutSmdCityVehiclePayloadVm {
  @ApiModelProperty()
  branch_id: number;

  @ApiModelProperty()
  employee_id_driver: number;

  @ApiModelProperty()
  smd_city_date: Date;

  @ApiModelProperty()
  vehicle_number: string;

  @ApiModelProperty()
  smd_city_trip: number;

  @ApiModelPropertyOptional()
  description: string;
}

export class ScanOutSmdCityItemPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  item_number: string;

}

export class ScanOutSmdCitySealPayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  seal_number: string;

  @ApiModelProperty()
  seal_seq: string;

}





