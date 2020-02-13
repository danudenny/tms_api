import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoPodBagDataDoPodDetailBagBagItemBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  refRepresentativeCode: string;
}

export class PrintDoPodBagDataDoPodDetailBagBagItemVm {
  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty({ type: () => PrintDoPodBagDataDoPodDetailBagBagItemBagVm })
  bag: PrintDoPodBagDataDoPodDetailBagBagItemBagVm = new PrintDoPodBagDataDoPodDetailBagBagItemBagVm();
}

export class PrintDoPodBagDataDoPodDetailBagVm {
  @ApiModelProperty({ type: () => PrintDoPodBagDataDoPodDetailBagBagItemVm })
  bagItem: PrintDoPodBagDataDoPodDetailBagBagItemVm = new PrintDoPodBagDataDoPodDetailBagBagItemVm();
}

export class PrintDoPodBagDataUserDriverEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoPodBagDataUserDriverVm {
  @ApiModelProperty({ type: () => PrintDoPodBagDataUserDriverEmployeeVm })
  employee: PrintDoPodBagDataUserDriverEmployeeVm = new PrintDoPodBagDataUserDriverEmployeeVm();
}

export class PrintDoPodBagDataBranchToVm {
  @ApiModelProperty()
  branchName: string;
}

export class PrintDoPodBagDataVm {
  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => [PrintDoPodBagDataDoPodDetailBagVm] })
  doPodDetailBag: PrintDoPodBagDataDoPodDetailBagVm[] = [];

  @ApiModelProperty({ type: () => PrintDoPodBagDataUserDriverVm })
  userDriver: PrintDoPodBagDataUserDriverVm = new PrintDoPodBagDataUserDriverVm();

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty({ type: () => PrintDoPodBagDataBranchToVm })
  branchTo: PrintDoPodBagDataBranchToVm = new PrintDoPodBagDataBranchToVm();
}

export class PrintDoPodBagVm {
  @ApiModelProperty({ type: () => PrintDoPodBagDataVm })
  data: PrintDoPodBagDataVm = new PrintDoPodBagDataVm();
}
