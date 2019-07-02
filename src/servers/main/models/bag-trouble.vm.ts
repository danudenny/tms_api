import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BagTroubleVm {
  @ApiModelProperty()
  bagTroubleId: number;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  statusResolveId: number;

  @ApiModelProperty({ format: 'date-time' })
  scanInDateTime: string;

  @ApiModelProperty()
  desc: string;

  @ApiModelProperty()
  bagTroubleName: string;
}
