import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class CheckAwbPayload {
  @ApiModelProperty()
  awbCheckId: string;

  @ApiModelProperty()
  awbNumber: string;
}
