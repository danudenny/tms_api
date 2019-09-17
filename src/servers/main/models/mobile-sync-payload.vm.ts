import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { MobileDeliveryVm } from './mobile-delivery.vm';

export class MobileSyncPayloadVm {
  @ApiModelProperty({ type: () => [MobileDeliveryVm] })
  deliveries: MobileDeliveryVm[];

  @ApiModelProperty({ format: 'date-time' })
  lastSyncDateTime: string;
}

export class MobileSyncImagePayloadVm {
  @ApiModelPropertyOptional()
  id?: number;

  @ApiModelPropertyOptional()
  awbItemId?: number;
}
