import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { MobileDeliveryVm } from './mobile-delivery.vm';

export class MobileDeliveryFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MobileDeliveryVm] })
  data: MobileDeliveryVm[];
}
