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
  korwilTransactionDetailPhotoId: string;

  @ApiModelProperty()
  korwilTransactionDetailId: string;

  @ApiModelProperty()
  korwilTransactionId: string;

  @ApiModelProperty({ type:ValidateBranchCoordinateResponseVm })
  coordinate: ValidateBranchCoordinateResponseVm;
}

export class BranchListKorwilResponseVm {
  @ApiModelProperty({ type: () => [DetailBranchListKorwilResponseVm] })
  branchList: DetailBranchListKorwilResponseVm[];
}