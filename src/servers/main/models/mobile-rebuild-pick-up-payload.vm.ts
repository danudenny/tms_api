import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileRebuildPickUpServicePayload {
  @ApiModelProperty()
  dateStart: string;

  @ApiModelProperty()
  dateEnd: string;
}