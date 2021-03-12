import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class CheckAwbPayloadVm {
  @ApiModelProperty()
  tracking_number: string;
}

export class CheckAwbResponseVM {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [CheckAwbVm]})
  data: CheckAwbVm[];
}

export class CheckAwbVm {

  @ApiModelProperty()
  tracking_number: string;

  @ApiModelProperty()
  chute_number: string;

  @ApiModelProperty()
  request_time: Date;

}
