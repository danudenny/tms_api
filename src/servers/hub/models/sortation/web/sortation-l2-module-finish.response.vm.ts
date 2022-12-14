import {ApiModelProperty} from '../../../../../shared/external/nestjs-swagger';

export class SortationL2ModuleFinishResponseVm {
    @ApiModelProperty()
    statusCode: number;

    @ApiModelProperty()
    message: string;

    @ApiModelProperty({type: () => [DataFinish]})
    data: DataFinish[];
}

export class DataFinish {
    @ApiModelProperty()
    doSortationId: string;

    @ApiModelProperty()
    doSortationCode: string;
}