import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobilePostKorwilTransactionPayloadVm {
  @ApiModelPropertyOptional()
  deletedPhotos: string[];

  @ApiModelPropertyOptional()
  insertedPhotos: string[];

  @ApiModelProperty()
  korwilTransactionDetailId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  branchId: string;
}

export class MobileKorwilListItemPayloadVm {
  @ApiModelProperty()
  branchId: string;
}