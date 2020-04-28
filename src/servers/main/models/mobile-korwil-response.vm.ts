import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ValidateBranchCoordinateResponseVm } from './branch-response.vm';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class DetailBranchListKorwilResponseVm {
  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;
}

export class MobileKorwilTransactionResponseVm {
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

  @ApiModelProperty()
  isDone: boolean;

  @ApiModelProperty()
  isRequired: boolean;
}

export class ItemListKorwilResponseVm {
  @ApiModelProperty({ type: () => [DetailItemListKorwilResponseVm] })
  itemList: DetailItemListKorwilResponseVm[];

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty()
  status: string;
}

export class DetailPhotoResponseVm {
  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  id: string;
}

export class DetailPhotoKorwilResponseVm {
  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  isDone: boolean;

  @ApiModelProperty()
  status: number;

  @ApiModelProperty({ type: () => [DetailPhotoResponseVm] })
  photo: DetailPhotoResponseVm[];
}

export class MobileUpdateProcessKorwilResponseVm {
  @ApiModelProperty()
  statusKorwilTransaction: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  status: string;
}

export class KorwilHistoryResponseDetailVm {
  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty()
  totalTask: number;

  @ApiModelProperty()
  checkInDate: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  checkOutDate: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  userId: string;
}

export class KorwilHistoryResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({
    type: () => [KorwilHistoryResponseDetailVm],
  })
  data: KorwilHistoryResponseDetailVm[];

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class DetailItemKorwilHistoryKorwil {
  @ApiModelProperty()
  korwilItemName: string;

  @ApiModelProperty()
  korwilItemId: string;

  @ApiModelProperty()
  korwilTransactionDetailId: string;

  @ApiModelProperty()
  isDone: string;

  @ApiModelProperty()
  statusItem: string;

  @ApiModelProperty()
  isRequired: boolean;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty({ type: () => [DetailPhotoResponseVm] })
  photo: DetailPhotoResponseVm[];
}

export class DetailHistoryKorwilResponseVm {
  @ApiModelProperty()
  statusKorwil: string;

  @ApiModelProperty()
  checkInDate: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  checkOutDate: string;

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty({
    type: () => [DetailItemKorwilHistoryKorwil],
  })
  items: DetailItemKorwilHistoryKorwil[];
}
