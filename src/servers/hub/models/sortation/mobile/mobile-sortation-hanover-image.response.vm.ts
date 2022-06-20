import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationHanoverImageResponseVm {
    @ApiModelProperty()
    statusCode: number;

    @ApiModelProperty()
    message: string;

    @ApiModelProperty({ type: () => [MobileSortationHanoverImageData] })
    data: MobileSortationHanoverImageData[];
}

export class MobileSortationHanoverImageData {
    @ApiModelProperty()
    attachmentId: number;

    @ApiModelProperty()
    url: string;
}
