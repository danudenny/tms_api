import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../../shared/external/nestjs-swagger';

export class SortationScanOutVehicleResponseVm {
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

export class SortationScanOutRouteResponseVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelPropertyOptional()
  branchCode: string;

  @ApiModelPropertyOptional()
  branchId: number;
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
}

export class SortationScanOutBagsResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [SortationBagDetailResponseVm]})
  data: SortationBagDetailResponseVm[];
}

export class SortationLoadDetailResponseVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  branchIdTo: number;

  @ApiModelProperty()
  branchIdToName: string;

  @ApiModelProperty()
  bagItems: string[];
}

export class SortationScanOutLoadResponseVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty({type: () => [SortationLoadDetailResponseVm]})
  doSortationDetails: SortationLoadDetailResponseVm[];
}

export class SortationScanOutImageVm {
  @ApiModelProperty()
  doSortationDetailAttachmentId: string;

  @ApiModelProperty()
  imageUrl: string;

  @ApiModelProperty()
  imageType: string;
}

export class SortationScanOutImageResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: SortationScanOutImageVm;
}
