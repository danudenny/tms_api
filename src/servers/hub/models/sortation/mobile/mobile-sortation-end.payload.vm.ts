import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationEndPayloadVm {
  @ApiModelProperty()
  doSortationDetailId: string;

  @ApiModelProperty()
  latitude: string;

  @ApiModelProperty()
  longitude: string;
}
