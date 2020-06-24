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
    route: string;

    @ApiModelProperty()
    vehicle_number: string;

    @ApiModelProperty()
    trip: number;

    @ApiModelProperty()
    total_weight: number;

    @ApiModelProperty()
    vehicle_capacity: number;

    @ApiModelProperty()
    percentage_load: number;

  }
