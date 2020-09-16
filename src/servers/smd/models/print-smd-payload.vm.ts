import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PrintSmdPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;
}

export class PrintBaggingPaperPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;

  @ApiModelPropertyOptional()
  userId: number;

  @ApiModelPropertyOptional()
  branchId: number;
}

export class PrintBaggingStickerPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;

  @ApiModelPropertyOptional()
  userId: number;

  @ApiModelPropertyOptional()
  branchId: number;
}

export class PrintVendorPaperPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;

  @ApiModelPropertyOptional()
  userId: number;

  @ApiModelPropertyOptional()
  branchId: number;
}

export class PrintReceivedBagPaperPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;

  @ApiModelPropertyOptional()
  userId: number;

  @ApiModelPropertyOptional()
  branchId: number;
}
export class PrintScaninDetailItemDataVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagWeight: string;
}

export class PrintScaninDetailEmployeeDataVm {
  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  nik: string;
}

export class PrintScaninDetailUserDataVm {
  @ApiModelProperty({ type: () => PrintScaninDetailEmployeeDataVm })
  employee: PrintScaninDetailEmployeeDataVm;
}

export class PrintScaninDetailBranchDataVm {
  @ApiModelProperty()
  branchName: string;
}

export class PrintScaninDetailVm {
  @ApiModelProperty()
  receivedBagId: string;

  @ApiModelProperty()
  receivedBagDate: string;

  @ApiModelProperty()
  receivedBagCode: string;

  @ApiModelProperty({ type: () => [PrintScaninDetailItemDataVm] })
  receivedBagDetails: PrintScaninDetailItemDataVm[];

  @ApiModelProperty({ type: () => PrintScaninDetailUserDataVm })
  user: PrintScaninDetailUserDataVm;

  @ApiModelProperty({ type: () => PrintScaninDetailBranchDataVm })
  branch: PrintScaninDetailBranchDataVm;
}

export class PrintScaninVm {
  @ApiModelProperty({ type: () => PrintScaninDetailVm })
  data: PrintScaninDetailVm;
}
