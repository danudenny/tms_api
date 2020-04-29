import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { IsDefined } from 'class-validator';

export class SmsTrackingStoreMessageResponseVm {
  @ApiModelProperty()
  smsTrackingMessageId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class SmsTrackingMsgResponseVm {
  @ApiModelProperty()
  smsTrackingMessageId: string;

  @ApiModelProperty()
  sentTo: string;

  @ApiModelProperty()
  isRepeated: boolean;

  @ApiModelProperty()
  note: string;
}

export class SmsTrackingListMessageResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingMsgResponseVm] })
  data: SmsTrackingMsgResponseVm[];
}

export class SmsTrackingStoreShiftResponseVm {
  @ApiModelProperty()
  smsTrackingShiftId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class SmsTrackingLstResponseVm {
  @ApiModelProperty()
  smsTrackingShiftId: string;

  @ApiModelProperty()
  workFrom: string;

  @ApiModelProperty()
  workTo: string;
}

export class SmsTrackingListShiftResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingLstResponseVm] })
  data: SmsTrackingLstResponseVm[];
}
