import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobileDeliveryVm } from './mobile-delivery.vm';
import { ReasonVm } from './reason.vm';

export class MobileInitDataResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  reason: ReasonVm[];

  @ApiModelProperty()
  awbStatus: any;

  @ApiModelProperty({ type: [MobileDeliveryVm] })
  delivery: MobileDeliveryVm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;
}
