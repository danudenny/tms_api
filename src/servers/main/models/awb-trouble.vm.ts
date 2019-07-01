import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class AwbTroubleVm {
  @ApiModelProperty()
  awbTroubleId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  statusResolveId: number;

  @ApiModelProperty({ format: 'date-time' })
  scanInDateTime: string;

  @ApiModelProperty()
  desc: string;

  @ApiModelProperty()
  awbTroubleName: string;
}
