import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';

export class LocusTimeSlotVm {
  @ApiModelProperty({ type: 'string', format: 'date-time' })
  start: string;

  @ApiModelProperty({ type: 'string', format: 'date-time' })
  end: string;
}

export class LocusCreateTaskVm {
  @ApiModelProperty()
  partnerIdLocus: number;

  @ApiModelProperty({ type: 'string', format: 'time', example: '10:00' })
  pickupStartHour: string;

  @ApiModelProperty({ type: 'string', format: 'time', example: '12:00' })
  pickupEndHour: string;

  @ApiModelProperty({ type: 'string', format: 'time', example: '13:00' })
  dropStartHour: string;

  @ApiModelProperty({ type: 'string', format: 'time', example: '17:00' })
  dropEndHour: string;

  @ApiModelPropertyOptional()
  totalTask: number;
}
