import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class AwbThirdPartyVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbThirdParty: string;
}

export class AwbThirdPartyUpdateResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
