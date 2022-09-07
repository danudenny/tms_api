import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationScanoutList {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  branchNameTo: string;

  @ApiModelProperty()
  branchAddressTo: string;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  totalBagSortir: number;

  @ApiModelProperty()
  doSortationTime: string;

  @ApiModelProperty()
  arrivalDateTime: string;
}

export class MobileSortationScanoutResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [MobileSortationScanoutList]})
  data: MobileSortationScanoutList[];
}
