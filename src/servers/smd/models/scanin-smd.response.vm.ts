import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ScanInSmdBagResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInBagVm]})
  data: ScanInBagVm[];
}

export class ScanInBagVm {
  @ApiModelProperty()
  show_number: string;

  @ApiModelProperty()
  id: string;

  @ApiModelProperty()
  rbid: string;

}

export class ScanInSmdBaggingResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInBaggingVm]})
  data: ScanInBaggingVm[];
}

export class ScanInBaggingVm {
  @ApiModelProperty({type: () => [ScanInBagNotScannedVm]})
  data_bag: ScanInBagNotScannedVm[];

  @ApiModelProperty({type: () => [ScanInBagScannedVm]})
  data_bag_scanned: ScanInBagScannedVm[];
  // @ApiModelProperty()
  // data_bag_scanned: object[];

}

export class ScanInBagScannedVm {
  @ApiModelProperty()
  bagnumber: string;

}

export class ScanInBagNotScannedVm {
  @ApiModelProperty()
  bagnumber: string;

}
