import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { ReasonVm } from './reason.vm';
import { RedeliveryVm } from './redelivery.vm';

export class InitDataVm {
}

export class MobileInitDataResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  reason: ReasonVm[];

  @ApiModelProperty()
  delivery: any;
}
