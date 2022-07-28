import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationScanoutDetail {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  doSortationTime: string;

  @ApiModelProperty()
  arrivalDateTime: string;

  @ApiModelProperty()
  branchNameTo: string;

  @ApiModelProperty()
  branchAddressTo: string;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  totalBagSortir: number;

  @ApiModelProperty()
  photoImgPath: string;

  @ApiModelProperty()
  signatureImgPath: string;

  @ApiModelProperty()
  bagList: [];

  @ApiModelProperty()
  bagSortirList: [];
}

export class MobileSortationScanoutDetailResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [MobileSortationScanoutDetail]})
  data: MobileSortationScanoutDetail[];
}