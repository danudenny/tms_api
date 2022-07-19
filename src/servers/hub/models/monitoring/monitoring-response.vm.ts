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
  branch_code: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  created_time: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  branch_id: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  city_name: string;

  @ApiModelProperty({nameCase: 'camelCase'})
  masuk: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  keluar: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  sortir_mesin: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  sortir_manual: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  total_sortir: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  tidak_sortir: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  dropoff: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  lebih_sortir: number;

  @ApiModelProperty({nameCase: 'camelCase'})
  tidak_keluar: number;
}

export class HubMonitoringTotalListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [HubMonitoringTotalList]})
  data: HubMonitoringTotalList[];
}

