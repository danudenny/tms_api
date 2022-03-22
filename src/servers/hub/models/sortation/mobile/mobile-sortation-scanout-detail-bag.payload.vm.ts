import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationScanoutDetailBagPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  isSortir: boolean;
}
