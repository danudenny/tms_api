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
