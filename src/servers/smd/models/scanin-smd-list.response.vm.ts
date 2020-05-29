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
export class ScanInSmdDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInDetailVm]})
  data: ScanInDetailVm[];
}

export class ScanInDetailVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_number: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representative_code: string;

  @ApiModelProperty()
  branch_name: string;

}

export class ScanInSmdDetailBaggingResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInDetailBaggingVm]})
  data: ScanInDetailBaggingVm[];
}

export class ScanInDetailBaggingVm {

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bagging_number: string;

  @ApiModelProperty()
  total_bag: string;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representative_code: string;

  @ApiModelProperty()
  branch_name: string;

}
