import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationHandoverImagePayloadVm {
    @ApiModelProperty()
    doSortationId: string;

    @ApiModelProperty()
    imageType: string;
}