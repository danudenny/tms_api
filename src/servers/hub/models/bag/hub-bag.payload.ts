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

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  transportationMode: string;
}

export class HubBagInsertAwbResponse extends BaseResponse {
  data: HubBagInsertAwbResponseData;
}

export class PrintHubBagQuery {
  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;
}

export interface HubBagSummary {
  bagNumber: string;
  weight: number;
  awbs: number;
  representativeCode: string;
  representativeName: string;
  transportationMode: string;
}
