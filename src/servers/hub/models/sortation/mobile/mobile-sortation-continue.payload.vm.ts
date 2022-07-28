import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationContinuePayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;
}