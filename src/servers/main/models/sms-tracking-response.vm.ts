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
  isRepeatedOver: boolean;

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

export class SmsTrackingShiftDataVm {
  @ApiModelProperty()
  smsTrackingShiftId: string;

  @ApiModelProperty()
  workFrom: string;

  @ApiModelProperty()
  workTo: string;
}

export class SmsTrackingListShiftResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingShiftDataVm] })
  data: SmsTrackingShiftDataVm[];
}

export class SmsTrackingListUserDataVm {
  @ApiModelProperty()
  smsTrackingUserId: string;

  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  phone: string;
}

export class SmsTrackingListUserResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingListUserDataVm] })
  data: SmsTrackingListUserDataVm[];
}
