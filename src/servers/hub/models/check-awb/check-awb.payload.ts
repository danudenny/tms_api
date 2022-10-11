import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class CheckAwbPayload {
  @ApiModelProperty()
  awbCheckId: string;

  @ApiModelProperty()
  awbNumber: string;
}

export interface GetAwbPayload {
  awbNumber: string;
}

export interface CheckAwbQueuePayload {
  awbCheckId: string;
  awbNumber: string;
  time: Date;
  userId: number;
}
