import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PrintBagCityPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;
}

export class PrintBagCityForPaperPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;

  @ApiModelPropertyOptional()
  userId: number;

  @ApiModelPropertyOptional()
  branchId: number;
}
