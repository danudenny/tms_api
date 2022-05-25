import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebLastMileUploadPayloadVm {
  @ApiModelProperty()
  status: number;

  @ApiModelProperty()
  photoType: string;
}