import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger/decorators';

export class PrintDoSortationDataUserDriverEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoSortationDataUserDriverVm {
  @ApiModelProperty()
  doSortationVehicleId: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty({ type: () => PrintDoSortationDataUserDriverEmployeeVm })
  employee: PrintDoSortationDataUserDriverEmployeeVm = new PrintDoSortationDataUserDriverEmployeeVm();
}

export class PrintDoSortationBagDataDoSortationDetailBagBagItemBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  refRepresentativeCode: string;
}

export class PrintDoSortationBagDataDoSortationDetailBagBagItemVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty({
    type: () => PrintDoSortationBagDataDoSortationDetailBagBagItemBagVm,
  })
  bag: PrintDoSortationBagDataDoSortationDetailBagBagItemBagVm = new PrintDoSortationBagDataDoSortationDetailBagBagItemBagVm();
}

export class PrintDoSortationBagDataNewDoSortationDetailBagBagItemVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  bagNumber: string;

  // @ApiModelProperty()
  // refRepresentativeCode: string;
}

export class PrintDoSortationDataBranchToVm {
  @ApiModelProperty()
  branchName: string;

  // @ApiModelProperty({
  //   type: () => PrintDoSortationDataBranchToRepresentativeVm,
  // })
  // representative: PrintDoSortationDataBranchToRepresentativeVm = new PrintDoSortationDataBranchToRepresentativeVm();
}

export class PrintDoSortationDataDoSortationDetailBagVm {
  @ApiModelProperty()
  doSortationDetailItemId: number;

  @ApiModelProperty()
  bagType: number;

  @ApiModelProperty({
    type: () => PrintDoSortationBagDataNewDoSortationDetailBagBagItemVm,
  })
  bagItem: PrintDoSortationBagDataNewDoSortationDetailBagBagItemVm = new PrintDoSortationBagDataNewDoSortationDetailBagBagItemVm();
}

export class PrintDoSortationDataDoSortationDetailVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  totalBagSortir: number;

  @ApiModelProperty()
  totalBag: number;

  // @ApiModelProperty()
  // totalBagRepresentative: number;

  // @ApiModelProperty()
  // sealNumber: string;

  @ApiModelProperty()
  arrivalTime: Date;

  @ApiModelProperty({ type: () => PrintDoSortationDataBranchToVm })
  branchTo: PrintDoSortationDataBranchToVm = new PrintDoSortationDataBranchToVm();

  @ApiModelProperty({
    type: () => [PrintDoSortationDataDoSortationDetailBagVm],
  })
  doSortationDetailItems: PrintDoSortationDataDoSortationDetailBagVm[] = [];

  // @ApiModelProperty({ type: () => [PrintDoSortationDataDoSortationDetailBaggingVm] })
  // doSortationBaggingItems: PrintDoSortationDataDoSortationDetailBaggingVm[] = [];

  // @ApiModelProperty({ type: () => [PrintDoSortationDataDoSortationDetailBagRepresentativeVm] })
  // doSortationBagRepresentativeItems: PrintDoSortationDataDoSortationDetailBagRepresentativeVm[] = [];
}

export class PrintDoSortationDataVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  doSortationCode: string;

  @ApiModelProperty()
  doSortationNote: string;

  @ApiModelProperty()
  totalBagSortir: number;

  @ApiModelProperty()
  totalBag: number;

  // @ApiModelProperty()
  // totalBagRepresentative: number;

  // @ApiModelProperty()
  // isIntercity: string;

  @ApiModelProperty({ type: () => PrintDoSortationDataUserDriverVm })
  doSortationVehicle: PrintDoSortationDataUserDriverVm = new PrintDoSortationDataUserDriverVm();

  @ApiModelProperty({ type: () => [PrintDoSortationDataDoSortationDetailVm] })
  doSortationDetails: PrintDoSortationDataDoSortationDetailVm[] = [];
}

export class PrintDoSortationVm {
  @ApiModelProperty({ type: () => PrintDoSortationDataVm })
  data: PrintDoSortationDataVm = new PrintDoSortationDataVm();
}
