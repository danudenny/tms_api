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
