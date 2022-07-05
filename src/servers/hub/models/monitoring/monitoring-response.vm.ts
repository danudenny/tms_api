import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

class HubMonitoringDetailList {
  @ApiModelProperty({ nameCase: 'camelCase' })
  scan_date: string;

  @ApiModelProperty({ nameCase: 'camelCase' })
  awb_number: string;

  @ApiModelProperty({ nameCase: 'camelCase' })
  bag_number: string;

  @ApiModelProperty({ nameCase: 'camelCase' })
  do: boolean;

  @ApiModelProperty({ nameCase: 'camelCase' })
  in: boolean;

  @ApiModelProperty({ nameCase: 'camelCase' })
  out: boolean;

  @ApiModelProperty({ nameCase: 'camelCase' })
  @ApiModelProperty()
  awb_status_name: string | null;
}

export class HubMonitoringDetailListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [HubMonitoringDetailList] })
  data: HubMonitoringDetailList[];
}

export class HubMonitoringTotalList {
  @ApiModelProperty({nameCase: 'camelCase'})
  branch_name: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  scan_date: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  problem: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  do_hub: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  manual_sortir: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  machine_sortir: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  branch_code: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  branch_id: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  city_name: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  scan_out: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  not_scan_out: number;
}

export class HubMonitoringTotalListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [HubMonitoringTotalList]})
  data: HubMonitoringTotalList[];
}

