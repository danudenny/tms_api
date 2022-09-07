import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class HubMonitoringDetailListVm {
  @ApiModelProperty()
  start_date: string;

  @ApiModelProperty()
  end_date: string;

  @ApiModelProperty()
  branch_id: number;

  @ApiModelProperty()
  bag_number: string;

  @ApiModelProperty()
  awb_number: string;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  page: number;
}

export class ExtMonitoringDetailListPayloadVm extends HubMonitoringDetailListVm {
  @ApiModelProperty()
  type:
    | 'masuk'
    | 'dropoff'
    | 'lebih-sortir'
    | 'total-sortir'
    | 'sortir-manual'
    | 'sortir-mesin'
    | 'tidak-sortir'
    | 'keluar'
    | 'tidak-keluar';
}
