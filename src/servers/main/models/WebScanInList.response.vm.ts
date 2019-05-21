import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebScanInListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  scan_in_datetime: string;

  @ApiModelProperty()
  awb_number: string;

  @ApiModelProperty()
  branch_name_scan: string;

  @ApiModelProperty()
  branch_name_from: string;

  @ApiModelProperty()
  employee_name: string;

  @ApiModelProperty()
  scan_in_status: string;
  data: any[];
  paging: { currentPage: number; nextPage: number; prevPage: number; totalPage: number; totalData: number; limit: number; };
}
