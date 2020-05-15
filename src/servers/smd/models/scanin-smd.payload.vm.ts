import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ScanInSmdPayloadVm {
  @ApiModelProperty()
  bag_item_number: string;

  @ApiModelProperty()
  user_id: number;

  @ApiModelProperty()
  branch_id: number;

  @ApiModelProperty()
  received_bag_id: number;

  @ApiModelProperty()
  employee_id: number;

  // @ApiModelPropertyOptional()
  // partner_id: string;

}
