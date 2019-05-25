import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { WebDeliveryVm } from './web-delivery.vm';

export class WebDeliveryFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebDeliveryVm] })
  data: WebDeliveryVm[];
}
