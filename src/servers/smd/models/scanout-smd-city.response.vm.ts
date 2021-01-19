import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanOutSmdCityVehicleResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutCityVehicleVm]})
  data: ScanOutCityVehicleVm[];
}

export class ScanOutCityVehicleVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  do_smd_vehicle_id: number;

  @ApiModelProperty()
  departure_schedule_date_time: Date;

  @ApiModelProperty()
  branch_code: string;

}


export class ScanOutSmdCitySealResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutCitySealVm]})
  data: ScanOutCitySealVm[];
}

export class ScanOutCitySealVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  seal_number: string;

}
