import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { AwbStatusVm } from './awb-status.vm';
import { MobileDeliveryVm, MobileDeliveryV2Vm } from './mobile-delivery.vm';
import { ReasonVm } from './reason.vm';
import { MobileCheckInResponseVm } from './mobile-check-in-response.vm';

export class MobileInitDataResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  reason: ReasonVm[];

  @ApiModelProperty({ type: () => [AwbStatusVm]})
  awbStatus: AwbStatusVm[];

  @ApiModelProperty({ type: [MobileDeliveryVm] })
  delivery: MobileDeliveryVm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;

  @ApiModelProperty()
  checkIn: MobileCheckInResponseVm;
}

export class MobileInitDataResponseV2Vm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  reason: ReasonVm[];

  @ApiModelProperty({ type: () => [AwbStatusVm] })
  awbStatus: AwbStatusVm[];

  @ApiModelProperty({ type: [MobileDeliveryV2Vm] })
  delivery: MobileDeliveryV2Vm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;

  @ApiModelProperty()
  checkIn: MobileCheckInResponseVm;
}

export class MobileInitDataDeliveryResponseVm {
  @ApiModelProperty({ type: [MobileDeliveryVm] })
  delivery: MobileDeliveryVm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;
}

export class MobileInitDataDeliveryV2ResponseVm {
  @ApiModelProperty({ type: [MobileDeliveryV2Vm] })
  delivery: MobileDeliveryV2Vm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;
}
