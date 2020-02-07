import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoPodDeliverStorePayloadBodyEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoPodDeliverStorePayloadBodyUserDriverVm {
  @ApiModelProperty()
  userId: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverStorePayloadBodyEmployeeVm })
  employee: PrintDoPodDeliverStorePayloadBodyEmployeeVm;
}

export class PrintDoPodDeliverStorePayloadBodyAwbVm {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeZip: string;

  @ApiModelProperty()
  totalCodValue: string;

  @ApiModelProperty()
  isCod: boolean;
}

export class PrintDoPodDeliverStorePayloadBodyAwbItemVm {
  @ApiModelProperty()
  awbItemId: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverStorePayloadBodyAwbVm })
  awb: PrintDoPodDeliverStorePayloadBodyAwbVm;
}

export class PrintDoPodDeliverStorePayloadBodyDoPodDeliverDetailVm {
  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverStorePayloadBodyAwbItemVm })
  awbItem: PrintDoPodDeliverStorePayloadBodyAwbItemVm;
}

export class PrintDoPodDeliverStorePayloadBodyDataVm {
  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty()
  doPodDeliverCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverStorePayloadBodyUserDriverVm })
  userDriver: PrintDoPodDeliverStorePayloadBodyUserDriverVm;

  @ApiModelProperty({ type: () => [PrintDoPodDeliverStorePayloadBodyDoPodDeliverDetailVm] })
  doPodDeliverDetails: PrintDoPodDeliverStorePayloadBodyDoPodDeliverDetailVm[];
}

export class PrintDoPodDeliverStorePayloadBodyVM {
  @ApiModelProperty({ type: () => PrintDoPodDeliverStorePayloadBodyDataVm })
  data: PrintDoPodDeliverStorePayloadBodyDataVm;
}
