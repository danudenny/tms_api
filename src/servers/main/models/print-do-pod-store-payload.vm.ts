import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoPodStorePayloadBodyAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;
}

export class PrintDoPodStorePayloadBodyAwbItemVm {
  @ApiModelProperty()
  awbItemId: string;

  @ApiModelProperty({ type: () => PrintDoPodStorePayloadBodyAwbVm })
  awb: PrintDoPodStorePayloadBodyAwbVm;
}

export class PrintDoPodStorePayloadBodyDoPodDetailVm {
  @ApiModelProperty()
  doPodDetaiId: string;

  @ApiModelProperty({ type: () => PrintDoPodStorePayloadBodyAwbItemVm })
  awbItem: PrintDoPodStorePayloadBodyAwbItemVm;
}

export class PrintDoPodStorePayloadBodyBranchToVm {
  @ApiModelProperty()
  branchName: string;
}

export class PrintDoPodStorePayloadBodyEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoPodStorePayloadBodyUserDriverVm {
  @ApiModelProperty()
  userId: string;

  @ApiModelProperty({ type: () => PrintDoPodStorePayloadBodyEmployeeVm })
  employee: PrintDoPodStorePayloadBodyEmployeeVm;
}

export class PrintDoPodStorePayloadBodyDataVm {
  @ApiModelProperty()
  doPodId: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => PrintDoPodStorePayloadBodyUserDriverVm })
  userDriver: PrintDoPodStorePayloadBodyUserDriverVm;

  @ApiModelProperty({ type: () => PrintDoPodStorePayloadBodyBranchToVm })
  branchTo: PrintDoPodStorePayloadBodyBranchToVm;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty({ type: () => [PrintDoPodStorePayloadBodyDoPodDetailVm] })
  doPodDetails: PrintDoPodStorePayloadBodyDoPodDetailVm[];
}

export class PrintDoPodStorePayloadBodyVm {
  @ApiModelProperty({ type: () => PrintDoPodStorePayloadBodyDataVm })
  data: PrintDoPodStorePayloadBodyDataVm;
}
