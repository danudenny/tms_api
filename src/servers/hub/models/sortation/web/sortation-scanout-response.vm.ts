import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../../shared/external/nestjs-swagger';

export class BaseSortsationRepsonseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  statusCode: number;
}

export class SortationScanOutVehicleVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationVehicleId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  doSortationTime: Date;

  @ApiModelPropertyOptional()
  employeeIdDriver: number;
}
export class SortationScanOutVehicleResponseVm extends BaseSortsationRepsonseVm {
  @ApiModelProperty({type: () => SortationScanOutVehicleVm})
  data: SortationScanOutVehicleVm;
}

export class SortationScanOutRouteVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchId: number;
}

export class SortationScanOutRouteResponseVm extends BaseSortsationRepsonseVm {
  @ApiModelProperty({type: () => SortationScanOutRouteVm})
  data: SortationScanOutRouteVm;
}

export class SortationBagDetailResponseVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  isSortir: boolean;

  @ApiModelProperty()
  message: string;
}

export class SortationScanOutBagsResponseVm extends BaseSortsationRepsonseVm {
  @ApiModelProperty({type: () => [SortationBagDetailResponseVm]})
  data: SortationBagDetailResponseVm[];
}

export class SortationLoadDetailVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  branchIdTo: number;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  isSortir: boolean;

  @ApiModelProperty()
  employeeDriverId: string;

  @ApiModelProperty()
  bagItems: string[];
}

export class SortationScanOutLoadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty({type: () => [SortationLoadDetailVm]})
  doSortationDetails: SortationLoadDetailVm[];
}

export class SortationScanOutLoadResponseVm extends BaseSortsationRepsonseVm {
  @ApiModelProperty({type: () => SortationScanOutLoadVm})
  data: SortationScanOutLoadVm;
}

export class SortationScanOutImageVm {
  @ApiModelProperty()
  doSortationDetailAttachmentId: string;

  @ApiModelProperty()
  imageUrl: string;

  @ApiModelProperty()
  imageType: string;
}

export class SortationScanOutImageResponseVm extends BaseSortsationRepsonseVm {
  @ApiModelProperty({type: () => [SortationScanOutImageVm]})
  data: SortationScanOutImageVm[];
}

export class SortationScanOutDonedVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;
}

export class SortationScanOutDoneResponseVm extends BaseSortsationRepsonseVm {
  @ApiModelProperty({type: () => SortationScanOutDonedVm})
  data: SortationScanOutDonedVm;
}
