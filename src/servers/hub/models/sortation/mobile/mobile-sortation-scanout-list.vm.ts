import {ApiModelProperty} from "../../../../../shared/external/nestjs-swagger";

export class MobileSortationScanoutListVm {
    @ApiModelProperty()
    doSortationId: string

    @ApiModelProperty()
    doSortationDetailId: string

    @ApiModelProperty()
    doSortationCode: string

    @ApiModelProperty()
    branchNameTo: string

    @ApiModelProperty()
    branchAddressTo: string

    @ApiModelProperty()
    totalBag: number

    @ApiModelProperty()
    totalBagSortir: number

    @ApiModelProperty()
    doSortationTime: string
}