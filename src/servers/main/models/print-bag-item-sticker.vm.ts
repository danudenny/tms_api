import { ApiModelProperty } from '../../../shared/external/nestjs-swagger/decorators';

// export class PrintBagItemStickerDataBagDistrictVm {
//   @ApiModelProperty()
//   districtName: boolean;

//   @ApiModelProperty()
//   districtCode: boolean;
// }

export class PrintBagItemStickerDataBagBranchVm {
  @ApiModelProperty()
  branchName: boolean;

  @ApiModelProperty()
  branchCode: boolean;
}

export class PrintBagItemStickerDataBagVm {
  @ApiModelProperty()
  bagNumber: boolean;

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
