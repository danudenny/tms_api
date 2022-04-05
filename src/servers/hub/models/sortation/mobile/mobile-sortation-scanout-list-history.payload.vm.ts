import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationScanoutListHistoryPayloadVm {
    @ApiModelProperty()
    start_date: string;

    @ApiModelProperty()
    end_date: string;
}
