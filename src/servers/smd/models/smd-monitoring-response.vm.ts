import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class MonitoringResponseVm extends BaseMetaResponseVm {

    @ApiModelProperty({ type: () => [MonitoringListVm] })
    data: MonitoringListVm[];
  }

export class MonitoringListVm {

    @ApiModelProperty()
    do_smd_time: Date;

    @ApiModelProperty()
    do_smd_code: string;

    @ApiModelProperty()
    branch_name_from: string;

    @ApiModelProperty()
    branch_name_to: string;

    @ApiModelProperty()
    vehicle_number: string;

    @ApiModelProperty()
    vehicle_name: string;

    @ApiModelProperty()
    trip: number;

    @ApiModelProperty()
    smd_trip: number;

    @ApiModelProperty()
    total_weight: number;

    @ApiModelProperty()
    total_colly: number;

    @ApiModelProperty()
    vehicle_capacity: number;

    @ApiModelProperty()
    percentage_load: number;

    @ApiModelProperty()
    departure_date_time: Date;

    @ApiModelProperty()
    transit_date_time: Date;

    @ApiModelProperty()
    arrival_date_time: Date;

    @ApiModelProperty()
    employee_driver_name: string;

  }
