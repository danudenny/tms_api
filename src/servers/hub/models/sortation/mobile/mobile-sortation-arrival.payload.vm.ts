import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationArrivalPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;
}
