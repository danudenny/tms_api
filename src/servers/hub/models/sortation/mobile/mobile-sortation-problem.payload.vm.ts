import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationProblemPayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  reasonNote: string;

  @ApiModelProperty()
  imageType: string;
}
