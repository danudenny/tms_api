import { ApiModelProperty } from '../external/nestjs-swagger';

export class BaseResponse {
  @ApiModelProperty()
  status: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: any;
}
