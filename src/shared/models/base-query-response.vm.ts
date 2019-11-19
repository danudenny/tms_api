import { ApiModelProperty } from '../external/nestjs-swagger';

export class BaseQueryResponseVm {
  @ApiModelProperty()
  data: any;

  @ApiModelProperty()
  total: number;
}
