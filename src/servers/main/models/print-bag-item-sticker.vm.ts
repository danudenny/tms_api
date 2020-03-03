import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintBagItemStickerDataBagDistrictVm {
  @ApiModelProperty()
  districtName: boolean;

  @ApiModelProperty()
  districtCode: boolean;
}

export class PrintBagItemStickerDataBagVm {
  @ApiModelProperty()
  bagId: boolean;

  @ApiModelProperty()
  bagNumber: boolean;

  @ApiModelProperty({ type: () => PrintBagItemStickerDataBagDistrictVm })
  district: PrintBagItemStickerDataBagDistrictVm;
}

export class PrintBagItemStickerDataVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagId: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty({ type: () => PrintBagItemStickerDataBagVm })
  bag: PrintBagItemStickerDataBagVm;
}

export class PrintBagItemStickerMetaVm {
  @ApiModelProperty()
  bagItemsTotal: number;
}

export class PrintBagItemStickerVm {
  @ApiModelProperty({ type: () => PrintBagItemStickerDataVm })
  data: PrintBagItemStickerDataVm;

  @ApiModelProperty({ type: () => PrintBagItemStickerMetaVm })
  meta: PrintBagItemStickerMetaVm;
}
