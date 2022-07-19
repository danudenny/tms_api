import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationUploadImagePayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  imageType: string;
}
