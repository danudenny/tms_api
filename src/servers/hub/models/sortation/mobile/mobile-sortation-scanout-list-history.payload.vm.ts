import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationScanoutListHistoryPayloadVm {
    @ApiModelProperty()
    startDate: string;

    @ApiModelProperty()
    endDate: string;
}
