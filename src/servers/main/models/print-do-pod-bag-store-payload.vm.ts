import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoPodBagStorePayloadBodyBranchToVm {
  @ApiModelProperty()
  branchName: string;
}

export class PrintDoPodBagStorePayloadBodyBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  refRepresentativeCode: string;
}

export class PrintDoPodBagStorePayloadBodyBagItemVm {
  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty({ type: () => PrintDoPodBagStorePayloadBodyBagVm })
  bag: PrintDoPodBagStorePayloadBodyBagVm;
}

export class PrintDoPodBagStorePayloadBodyDoPodDetailBagVm {
  @ApiModelProperty()
  doPodDetailBagId: string;

  @ApiModelProperty({ type: () => PrintDoPodBagStorePayloadBodyBagItemVm })
  bagItem: PrintDoPodBagStorePayloadBodyBagItemVm;
}

export class PrintDoPodBagStorePayloadBodyEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoPodBagStorePayloadBodyUserDriverVm {
  @ApiModelProperty()
  userId: string;

  @ApiModelProperty({ type: () => PrintDoPodBagStorePayloadBodyEmployeeVm })
  employee: PrintDoPodBagStorePayloadBodyEmployeeVm;
}

export class PrintDoPodBagStorePayloadBodyDataVm {
  @ApiModelProperty()
  doPodId: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => [PrintDoPodBagStorePayloadBodyDoPodDetailBagVm] })
  doPodDetailBag: PrintDoPodBagStorePayloadBodyDoPodDetailBagVm[];

  @ApiModelProperty({ type: () => PrintDoPodBagStorePayloadBodyUserDriverVm })
  userDriver: PrintDoPodBagStorePayloadBodyUserDriverVm;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty({ type: () => PrintDoPodBagStorePayloadBodyBranchToVm })
  branchTo: PrintDoPodBagStorePayloadBodyBranchToVm;
}

export class PrintDoPodBagStorePayloadBodyVm {
  @ApiModelProperty({ type: () => PrintDoPodBagStorePayloadBodyDataVm })
  data: PrintDoPodBagStorePayloadBodyDataVm;
}
