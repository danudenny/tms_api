import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseResponse } from '../../../../shared/models/base-response';

class StartCheckAwbData {
  @ApiModelProperty()
  awbCheckId: string;
}

export class StartCheckAwbResponse extends BaseResponse {
  @ApiModelProperty()
  data: StartCheckAwbData;
}

class CheckAwbData {
  @ApiModelProperty()
  awbCheckId: string;

  @ApiModelProperty()
  awbNumber: string;
}

export class CheckAwbResponse extends BaseResponse {
  @ApiModelProperty()
  data: CheckAwbData;
}
