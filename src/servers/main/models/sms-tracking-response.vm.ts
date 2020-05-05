import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { IsDefined } from 'class-validator';

export class SmsTrackingStoreMessageResponseVm {
  @ApiModelProperty()
  smsTrackingMessageId: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class SmsTrackingMsgResponseVm {
  @ApiModelProperty()
  smsTrackingMessageId: number;

  @ApiModelProperty()
  sentTo: number;

  @ApiModelProperty()
  sentToName: string;

  @ApiModelProperty()
  isRepeated: boolean;

  @ApiModelProperty()
  isRepeatedOver: boolean;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  awbStatusName: string;
}

export class SmsTrackingListMessageResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingMsgResponseVm] })
  data: SmsTrackingMsgResponseVm[];
}

export class SmsTrackingStoreShiftResponseVm {
  @ApiModelProperty()
  smsTrackingShiftId: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class SmsTrackingShiftDataVm {
  @ApiModelProperty()
  smsTrackingShiftId: number;

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
  smsTrackingUserId: number;

  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  phone: string;
}

export class SmsTrackingListUserResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingListUserDataVm] })
  data: SmsTrackingListUserDataVm[];
}
