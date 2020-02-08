import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ValidateBranchCoordinateResponseVm } from './branch-response.vm';

export class DetailBranchListKorwilResponseVm {
  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;
}

export class MobilePostKorwilTransactionResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  status: string;
}

export class BranchListKorwilResponseVm {
  @ApiModelProperty({ type: () => [DetailBranchListKorwilResponseVm] })
  branchList: DetailBranchListKorwilResponseVm[];
}

export class DetailItemListKorwilResponseVm {
  @ApiModelProperty()
  korwilItemName: string;

  @ApiModelProperty()
  korwilItemId: string;

  @ApiModelProperty()
  photoId: string;

  @ApiModelProperty()
  status: number;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  korwilTransactionDetailId: string;
}

export class ItemListKorwilResponseVm {
  @ApiModelProperty({ type: () => [DetailItemListKorwilResponseVm] })
  itemList: DetailItemListKorwilResponseVm[];

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty()
  isDone: string;
}

// export class DetailPhotoResponseVm {
//   @ApiModelProperty()
//   url: string;

//   @ApiModelProperty()
//   note: string;

//   @ApiModelProperty()
//   isDone: boolean;

//   @ApiModelProperty()
//   status: number;
// }

export class DetailPhotoKorwilResponseVm {
  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  isDone: boolean;

  @ApiModelProperty()
  status: number;

  @ApiModelProperty()
  urlPhotos: string[];
}