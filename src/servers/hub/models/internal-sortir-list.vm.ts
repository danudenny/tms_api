import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ListDataBranchSortirLogVm {

  @ApiModelProperty()
  scanDate: string;

  @ApiModelProperty()
  qtySucceed: string;

  @ApiModelProperty()
  qtyFail: string;

  // @ApiModelProperty()
  // branchSortirLogId: string;

}

export class ListBranchSortirLogVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListDataBranchSortirLogVm] })
  data: ListDataBranchSortirLogVm[];
}

export class DetailDataBranchSortirLogVm {

  @ApiModelProperty()
  scanDate: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  sealNumber: string;

  @ApiModelProperty()
  noChute: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  branchIdLastmile: string;

  @ApiModelProperty()
  branchNameLastmile: string;

  @ApiModelProperty()
  isCod: string;

  @ApiModelProperty()
  isSucceed: string;

  @ApiModelProperty()
  reason: string;

  @ApiModelProperty()
  updatedTime: string;
}

export class DetailBranchSortirLogVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DetailDataBranchSortirLogVm] })
  data: DetailDataBranchSortirLogVm[];
}
