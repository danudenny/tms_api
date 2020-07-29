import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class TrackingNotePayloadVm {
  @ApiModelProperty()
  arrAwbHistoryId: number[];
}
