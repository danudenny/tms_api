import {ApiModelProperty} from "../../../../../shared/external/nestjs-swagger";

export class MobileSortationScanoutDetailBagPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: number

  @ApiModelProperty()
  isSortir: boolean
}