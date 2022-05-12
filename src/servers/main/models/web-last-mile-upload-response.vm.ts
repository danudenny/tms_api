import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebLastMileUploadResponseVm {
  @ApiModelProperty()
  attachmentTmsId: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}