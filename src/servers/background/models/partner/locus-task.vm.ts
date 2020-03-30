import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class LocusTimeSlotVm {
  @ApiModelProperty({ type: 'string', format: 'date-time' })
  start: string;

  @ApiModelProperty({ type: 'string', format: 'date-time' })
  end: string;
}
