import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoPodDataDoPodDetailAwbItemAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;
}

export class PrintDoPodDataDoPodDetailAwbItemVm {
  @ApiModelProperty({ type: () => PrintDoPodDataDoPodDetailAwbItemAwbVm })
  awb: PrintDoPodDataDoPodDetailAwbItemAwbVm = new PrintDoPodDataDoPodDetailAwbItemAwbVm();
}

export class PrintDoPodDataDoPodDetailVm {
  @ApiModelProperty({ type: () => PrintDoPodDataDoPodDetailAwbItemVm })
  awbItem: PrintDoPodDataDoPodDetailAwbItemVm = new PrintDoPodDataDoPodDetailAwbItemVm();
}

export class PrintDoPodDataBranchToVm {
  @ApiModelProperty()
  branchName: string;
}

export class PrintDoPodDataUserDriverEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoPodDataUserDriverVm {
  @ApiModelProperty({ type: () => PrintDoPodDataUserDriverEmployeeVm })
  employee: PrintDoPodDataUserDriverEmployeeVm = new PrintDoPodDataUserDriverEmployeeVm();
}

export class PrintDoPodDataVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => PrintDoPodDataUserDriverVm })
  userDriver: PrintDoPodDataUserDriverVm = new PrintDoPodDataUserDriverVm();

  @ApiModelProperty({ type: () => PrintDoPodDataBranchToVm })
  branchTo: PrintDoPodDataBranchToVm = new PrintDoPodDataBranchToVm();

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty({ type: () => [PrintDoPodDataDoPodDetailVm] })
  doPodDetails: PrintDoPodDataDoPodDetailVm[] = [];
}

export class PrintDoPodVm {
  @ApiModelProperty({ type: () => PrintDoPodDataVm })
  data: PrintDoPodDataVm = new PrintDoPodDataVm();
}
