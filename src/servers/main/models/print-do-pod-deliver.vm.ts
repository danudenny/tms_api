import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintDoPodDeliverDataUserDriverEmployeeVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  nickname: string;
}

export class PrintDoPodDeliverDataUserDriverVm {
  @ApiModelProperty({ type: () => PrintDoPodDeliverDataUserDriverEmployeeVm })
  employee: PrintDoPodDeliverDataUserDriverEmployeeVm = new PrintDoPodDeliverDataUserDriverEmployeeVm();
}

export class PrintDoPodDeliverDataDoPodDeliverDetailAwbItemAwbVm {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  totalWeight: any;

  @ApiModelProperty()
  consigneeZip: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  isCod: boolean;
}

export class PrintDoPodDeliverDataDoPodDeliverDetailAwbItemVm {
  @ApiModelProperty({ type: () => PrintDoPodDeliverDataDoPodDeliverDetailAwbItemAwbVm })
  awb: PrintDoPodDeliverDataDoPodDeliverDetailAwbItemAwbVm = new PrintDoPodDeliverDataDoPodDeliverDetailAwbItemAwbVm();
}

export class PrintDoPodDeliverDataDoPodDeliverDetailVm {
  @ApiModelProperty({ type: () => PrintDoPodDeliverDataDoPodDeliverDetailAwbItemVm })
  awbItem: PrintDoPodDeliverDataDoPodDeliverDetailAwbItemVm = new PrintDoPodDeliverDataDoPodDeliverDetailAwbItemVm();
}

export class PrintDoPodDeliverDataVm {
  @ApiModelProperty()
  doPodDeliverId: number;

  @ApiModelProperty()
  doPodDeliverCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverDataUserDriverVm })
  userDriver: PrintDoPodDeliverDataUserDriverVm = new PrintDoPodDeliverDataUserDriverVm();

  @ApiModelProperty({ type: () => [PrintDoPodDeliverDataDoPodDeliverDetailVm] })
  doPodDeliverDetails: PrintDoPodDeliverDataDoPodDeliverDetailVm[] = [];
}

export class PrintDoPodDeliverVm {
  @ApiModelProperty({ type: () => PrintDoPodDeliverDataVm })
  data: PrintDoPodDeliverDataVm = new PrintDoPodDeliverDataVm();
}
