import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseResponse } from '../../../../shared/models/base-response';

export class MetabaseIframePayload {
  @ApiModelProperty()
  dashboard: number;
}

class IframeData {
  @ApiModelProperty()
  url: string;
}

export class IframeResponse extends BaseResponse {
  @ApiModelProperty()
  data: IframeData;
}
