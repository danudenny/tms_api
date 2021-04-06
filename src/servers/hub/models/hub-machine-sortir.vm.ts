import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class CheckAwbPayloadVm {
  @ApiModelProperty()
  tracking_number: string;

  @ApiModelProperty()
  sorting_branch_id: number;
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
  state: number;

  @ApiModelProperty()
  tracking_number: string;

  @ApiModelProperty()
  chute_number: string [];

  @ApiModelProperty()
  request_time: Date;

}
