import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintBagItemPaperDataBagDistrictVm {
  @ApiModelProperty()
  districtCode: string;

  @ApiModelProperty()
  districtName: string;
}

export class PrintBagItemPaperDataBagItemAwbAwbItemAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  totalWeightFinalRounded: number;
}

export class PrintBagItemPaperDataBagItemAwbAwbItemVm {
  @ApiModelProperty({ type: () => PrintBagItemPaperDataBagItemAwbAwbItemAwbVm })
  awb: PrintBagItemPaperDataBagItemAwbAwbItemAwbVm;
}

export class PrintBagItemPaperDataBagItemAwbVm {
  @ApiModelProperty({ type: () => PrintBagItemPaperDataBagItemAwbAwbItemVm })
  awbItem: PrintBagItemPaperDataBagItemAwbAwbItemVm;
}

export class PrintBagItemPaperDataBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty({ type: () => PrintBagItemPaperDataBagDistrictVm })
  district: PrintBagItemPaperDataBagDistrictVm;
}

export class PrintBagItemPaperDataVm {
  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty({ type: () => PrintBagItemPaperDataBagVm })
  bag: PrintBagItemPaperDataBagVm;

  @ApiModelProperty({ type: () => PrintBagItemPaperDataBagItemAwbVm })
  bagItemAwbs: PrintBagItemPaperDataBagItemAwbVm[];
}

export class PrintBagItemPaperVm {
  @ApiModelProperty({ type: () => PrintBagItemPaperDataVm })
  data: PrintBagItemPaperDataVm = new PrintBagItemPaperDataVm();
}
