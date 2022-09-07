import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class MobileSortationDepaturePayloadVm {
  @ApiModelProperty()
  doSortationId: string;

  @ApiModelProperty()
  longitude: string;

  @ApiModelProperty()
  latitude: string;
}
