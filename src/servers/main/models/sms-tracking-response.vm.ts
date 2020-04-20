import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { IsDefined } from 'class-validator';

export class SmsTrackingStoreResponseVm {
  @ApiModelProperty()
  smsTrackingMessageId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class SmsTrackingResponseVm {
  @ApiModelProperty()
  smsTrackingSmsId: string;

  @ApiModelProperty()
  sentTo: string;

  @ApiModelProperty()
  isRepeated: boolean;

  @ApiModelProperty()
  note: string;
}

export class SmsTrackingListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmsTrackingResponseVm] })
  data: SmsTrackingResponseVm[];
}
