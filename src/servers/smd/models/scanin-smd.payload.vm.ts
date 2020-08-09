import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ScanInSmdPayloadVm {
  @ApiModelProperty()
  bag_item_number: string;

  @ApiModelProperty()
  received_bag_id: number;

}
