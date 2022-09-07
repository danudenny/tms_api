import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationCancelPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;
}
