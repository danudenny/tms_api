import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ValidateBranchKoordinateResponseVm } from './branch-response.vm';

export class DetailBranchListKorwilResponseVm {
  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;
}

export class MobilePostKorwilTransactionResponseVm {
  @ApiModelProperty()
  korwilTransactionDetailPhotoId: string;

  @ApiModelProperty()
  korwilTransactionDetailId: string;

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty({ type:ValidateBranchKoordinateResponseVm })
  coordinate: ValidateBranchKoordinateResponseVm;
}

export class BranchListKorwilResponseVm {
  @ApiModelProperty({ type: () => [DetailBranchListKorwilResponseVm] })
  branchList: DetailBranchListKorwilResponseVm[];
}