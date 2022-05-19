import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationHandoverPayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  note: string;
}
