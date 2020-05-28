import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanInSmdListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanInSmdListVm] })
  data: ScanInSmdListVm[];
}

export class ScanInSmdListVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  do_smd_time: Date;

  @ApiModelProperty()
  fullname: string;

  @ApiModelProperty()
  vehicle_number: string;

  @ApiModelProperty()
  branch_from_name: string;

  @ApiModelProperty()
  branch_to_name: string;

  @ApiModelProperty()
  total_bag: number;

  @ApiModelProperty()
  total_bagging: number;
}

