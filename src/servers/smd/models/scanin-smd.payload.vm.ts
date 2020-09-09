import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ScanInSmdPayloadVm {
  @ApiModelProperty()
  bag_item_number: string;

  @ApiModelProperty()
  received_bag_id: number;

}

export class ScanInSmdMorePayloadVm {
  @ApiModelProperty()
  bag_item_number: string[];

  @ApiModelProperty()
  received_bag_id: number;
}

export class ScaninDetailScanPayloadVm {
  @ApiModelProperty()
  received_bag_id: string;
}
