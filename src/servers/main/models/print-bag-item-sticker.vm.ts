import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintBagItemStickerDataBagBranchVm {
  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchCode: string;
}

export class PrintBagItemStickerDataBagVm {
  @ApiModelProperty()
  bagNumber: string;

  // @ApiModelProperty({ type: () => PrintBagItemStickerDataBagDistrictVm })
  // district: PrintBagItemStickerDataBagDistrictVm;

  @ApiModelProperty({
    type: () => PrintBagItemStickerDataBagBranchVm,
  })
  branch: PrintBagItemStickerDataBagBranchVm;

  @ApiModelProperty({
    type: () => PrintBagItemStickerDataBagBranchVm,
  })
  branchTo: PrintBagItemStickerDataBagBranchVm;
}

export class PrintBagItemStickerDataVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty({ type: () => PrintBagItemStickerDataBagVm })
  bag: PrintBagItemStickerDataBagVm;
}

export class PrintBagItemStickerMetaVm {
  @ApiModelProperty()
  bagItemAwbsTotal: number;
}

export class PrintBagItemStickerVm {
  @ApiModelProperty({ type: () => PrintBagItemStickerDataVm })
  data: PrintBagItemStickerDataVm;

  @ApiModelProperty({ type: () => PrintBagItemStickerMetaVm })
  meta: PrintBagItemStickerMetaVm;
}
