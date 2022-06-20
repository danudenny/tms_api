import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationUploadImageResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [MobileSortationUploadImageData] })
  data: MobileSortationUploadImageData[];
}

export class MobileSortationUploadImageData {
  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  url: string;
}
