import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { MobileDeliveryVm } from './mobile-delivery.vm';

export class MobileSyncPayloadVm {
  @ApiModelProperty({ type: () => [MobileDeliveryVm] })
  deliveries: MobileDeliveryVm[];

  @ApiModelProperty({ format: 'date-time' })
  lastSyncDateTime: string;
}

export class MobileSyncImagePayloadVm {
  // do_pod_deliver_detail_id
  @ApiModelProperty()
  id: string;

  @ApiModelProperty()
  awbItemId: string;
}
