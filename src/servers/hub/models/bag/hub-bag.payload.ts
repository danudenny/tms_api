import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../../shared/external/nestjs-swagger';
import { BaseResponse } from '../../../../shared/models/base-response';

export class HubBagInsertAwbPayload {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelPropertyOptional()
  bagId?: string;

  @ApiModelPropertyOptional()
  bagItemId?: string;
}

class HubBagInsertAwbResponseData {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagId: string;

  @ApiModelProperty()
  bagItemId: string;
}

export class HubBagInsertAwbResponse extends BaseResponse {
  data: HubBagInsertAwbResponseData;
}
