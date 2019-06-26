import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MetaPayloadPageSort } from '../../../shared/models/base-meta-payload.vm';

export class WebDeliveryList extends MetaPayloadPageSort {
  @ApiModelProperty()
  doPodId: number;
}
