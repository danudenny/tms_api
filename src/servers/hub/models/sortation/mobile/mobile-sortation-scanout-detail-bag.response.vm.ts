import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationScanoutDetailBag {
  @ApiModelProperty()
  bagNumber: string;
}

export class MobileSortationScanoutDetailBagResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [MobileSortationScanoutDetailBag]})
  data: MobileSortationScanoutDetailBag[];
}
