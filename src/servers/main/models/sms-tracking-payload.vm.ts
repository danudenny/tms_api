import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { IsDefined } from 'class-validator';
import {BaseMetaPayloadVm} from '../../../shared/models/base-meta-payload.vm';

export class SmsTrackingStoreMessagePayloadVm {
  @ApiModelProperty()
  isRepeated: boolean;

  @ApiModelProperty()
  isRepeatedOver: boolean;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty({
    example: 12345,
  })
  sentTo: number;

  @ApiModelProperty({
    example: 12345,
  })
  awbStatusId: number;
}

export class SmsTrackingListMessagePayloadVm extends BaseMetaPayloadVm {}

export class SmsTrackingStoreShiftPayloadVm {
  @ApiModelProperty({
    example: ['23:59', '07:00'],
  })
  workFrom: string;

  @ApiModelProperty({
    example: ['23:59', '07:00'],
  })
  workTo: string;
}

export class SmsTrackingListShiftPayloadVm extends BaseMetaPayloadVm {}

export class SmsTrackingStoreUserPayloadVm {
  @ApiModelProperty({
    example: 'Awb Number',
  })
  label: string;

  @ApiModelProperty({
    example: 'awbNumber',
  })
  name: string;
}

export class SmsTrackingListUserPayloadVm extends BaseMetaPayloadVm {}

export class SmsTrackingDeleteUserPayloadVm {
  @ApiModelProperty({
    example: [1, 2],
  })
  trackingMessageId: number[];
}

export class GenerateReportSmsTrackingPayloadVm {
  @ApiModelProperty({
    example: '2020-02-28',
  })
  date: string;

  @ApiModelProperty({
    example: 20020003,
  })
  smsTrackingShiftId: number;
}
