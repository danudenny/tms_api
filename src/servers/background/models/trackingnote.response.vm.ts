import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { TrackingNoteVm } from './trackingnote.vm';

export class TrackingNoteResponseVm {
  @ApiModelProperty({ type: () => [TrackingNoteVm] })
  data: TrackingNoteVm[];

  @ApiModelProperty()
  message: string;
}
