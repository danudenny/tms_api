import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobilePostKorwilTransactionPayloadVm {
  @ApiModelPropertyOptional()
  deletedPhotos: string;

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

  @ApiModelProperty()
  isDone: boolean;
}

export class MobileValidateCoordinateKorwilTransactionPayloadVm {
  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  branchId: string;
}

export class MobileKorwilListItemPayloadVm {
  @ApiModelProperty()
  branchId: string;
}

export class MobileUpdateProcessKorwilPayloadVm {
  @ApiModelProperty()
  korwilTransactionId: string;
}