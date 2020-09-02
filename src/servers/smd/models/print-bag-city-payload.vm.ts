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

export class BagCityRepresentativeItem {
  @ApiModelProperty()
  bagRepresentativeItemId: string;

  @ApiModelProperty()
  refAwbNumber: string;

  @ApiModelProperty()
  weight: string;
}

export class BagCityExternalPrintPayloadVm {
  @ApiModelProperty()
  bagRepresentativeId: number;

  @ApiModelProperty()
  bagRepresentativeCode: string;

  @ApiModelProperty()
  bagRepresentativeDate: string;

  @ApiModelProperty({ type: () => [BagCityRepresentativeItem] })
  bagRepresentativeItems: BagCityRepresentativeItem[];

  @ApiModelProperty()
  representativeId: string;

  @ApiModelProperty()
  representativeCode: string;
}

export class BagCityExternalPrintExecutePayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  printCopy: number;

  @ApiModelProperty()
  userId: number;
}
