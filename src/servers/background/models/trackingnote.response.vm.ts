import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { TrackingNoteVm } from './trackingnote.vm';

export class TrackingNoteResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [TrackingNoteVm] })
  data: TrackingNoteVm[];
}
