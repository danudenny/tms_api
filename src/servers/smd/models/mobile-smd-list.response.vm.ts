import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class MobileSmdListVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  departure_schedule_date_time: Date;

  @ApiModelProperty()
  branch_name: string;

  @ApiModelProperty()
  address: string;

  @ApiModelProperty()
  total_bag: number;

  @ApiModelProperty()
  total_bagging: number;

}

export class MobileSmdListDetailBagVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_id: number;

  @ApiModelProperty()
  bag_number: string;

}

export class MobileSmdListDetailBaggingVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bagging_id: number;

  @ApiModelProperty()
  bagging_number: string;

}
