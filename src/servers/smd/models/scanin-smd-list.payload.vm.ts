import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ScanInSmdDetailPayloadVm {
  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_type: number;

}

export class ScanInSmdDetailMorePayloadVm {
  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  bag_type: number;
}

