import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { IsDefined } from 'class-validator';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';

export class SmsTrackingStorePayloadVm {
  @ApiModelProperty()
  isRepeated: boolean;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty({
    example: ['Sender', 'Recepient'],
  })
  @IsDefined({ message: `Label Penerima harus 'Sender' atau 'Recepient'` })
  sentTo: 'Sender' | 'Recepient';
}

export class SmsTrackingListPayloadVm extends BaseMetaPayloadVm {}
