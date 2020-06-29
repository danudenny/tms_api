import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class CheckSpkPayloadVm {
  @ApiModelProperty()
  spk_code: string;
}

export class CheckSpkResponseVM {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [CheckSpkVm]})
  data: CheckSpkVm[];
}

export class CheckSpkVm {

  @ApiModelProperty()
  awb_number: string;

}
