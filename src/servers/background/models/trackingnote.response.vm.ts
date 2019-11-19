import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { TrackingNoteVm } from './trackingnote.vm';

export class TrackingNoteResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [TrackingNoteVm] })
  data: TrackingNoteVm[];
}
