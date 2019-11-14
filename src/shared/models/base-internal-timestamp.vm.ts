import { ApiModelProperty } from '../external/nestjs-swagger';

export class BaseTimestampVm {
  @ApiModelProperty({ type: 'string', format: 'date-time' })
  createdAt: string;

  @ApiModelProperty({ type: 'string', format: 'date-time' })
  updatedAt: string;
}
