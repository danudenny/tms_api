import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoSmdDataUserDriverEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoSmdDataUserDriverVm {
  @ApiModelProperty()
  doSmdVehicleId: number;

  @ApiModelProperty({ type: () => PrintDoSmdDataUserDriverEmployeeVm })
  employee: PrintDoSmdDataUserDriverEmployeeVm = new PrintDoSmdDataUserDriverEmployeeVm();
}

export class PrintDoSmdBagDataDoSmdDetailBagBagItemBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  refRepresentativeCode: string;
}

export class PrintDoSmdBagDataDoSmdDetailBagBagItemVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty({ type: () => PrintDoSmdBagDataDoSmdDetailBagBagItemBagVm })
  bag: PrintDoSmdBagDataDoSmdDetailBagBagItemBagVm = new PrintDoSmdBagDataDoSmdDetailBagBagItemBagVm();
}

export class PrintDoSmdBagDataNewDoSmdDetailBagBagItemVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  refRepresentativeCode: string;
}

export class PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm {
  @ApiModelProperty()
  baggingId: number;

  @ApiModelProperty()
  baggingCode: string;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  representativeCode: string;
}

export class PrintDoSmdDataBranchToRepresentativeVm {
  @ApiModelProperty()
  representativeCode: string;
}

export class PrintDoSmdDataBranchToVm {
  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty({ type: () => PrintDoSmdDataBranchToRepresentativeVm })
  representative: PrintDoSmdDataBranchToRepresentativeVm = new PrintDoSmdDataBranchToRepresentativeVm();
}

export class PrintDoSmdDataDoSmdDetailBagVm {
  @ApiModelProperty()
  doSmdDetailItemId: number;

  @ApiModelProperty()
  bagType: number;

  @ApiModelProperty({ type: () => PrintDoSmdBagDataNewDoSmdDetailBagBagItemVm })
  bagItem: PrintDoSmdBagDataNewDoSmdDetailBagBagItemVm = new PrintDoSmdBagDataNewDoSmdDetailBagBagItemVm();
}

export class PrintDoSmdDataDoSmdDetailBaggingVm {
  @ApiModelProperty()
  doSmdDetailItemId: number;

  @ApiModelProperty()
  bagType: number;

  @ApiModelProperty({ type: () => PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm })
  baggingItem: PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm = new PrintDoSmdBaggingDataDoSmdDetailBagBaggingItemVm();
}

export class PrintDoSmdDataDoSmdDetailVm {
  @ApiModelProperty()
  doSmdDetailId: number;

  @ApiModelProperty()
  totalBagging: number;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  sealNumber: string;

  @ApiModelProperty()
  arrivalTime: Date;

  @ApiModelProperty({ type: () => PrintDoSmdDataBranchToVm })
  branchTo: PrintDoSmdDataBranchToVm = new PrintDoSmdDataBranchToVm();

  @ApiModelProperty({ type: () => [PrintDoSmdDataDoSmdDetailBagVm] })
  doSmdDetailItems: PrintDoSmdDataDoSmdDetailBagVm[] = [];

  @ApiModelProperty({ type: () => [PrintDoSmdDataDoSmdDetailBaggingVm] })
  doSmdBaggingItems: PrintDoSmdDataDoSmdDetailBaggingVm[] = [];
}

export class PrintDoSmdDataVm {
  @ApiModelProperty()
  doSmdId: number;

  @ApiModelProperty()
  doSmdCode: string;

  @ApiModelProperty()
  totalBagging: number;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty({ type: () => PrintDoSmdDataUserDriverVm })
  doSmdVehicle: PrintDoSmdDataUserDriverVm = new PrintDoSmdDataUserDriverVm();

  @ApiModelProperty({ type: () => [PrintDoSmdDataDoSmdDetailVm] })
  doSmdDetails: PrintDoSmdDataDoSmdDetailVm[] = [];
}

export class PrintDoSmdVm {
  @ApiModelProperty({ type: () => PrintDoSmdDataVm })
  data: PrintDoSmdDataVm = new PrintDoSmdDataVm();
}
