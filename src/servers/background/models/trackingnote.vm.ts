import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class TrackingNoteVm {
  @ApiModelProperty()
  awbHistoryId: number;

  @ApiModelProperty()
  receiptNumber: string;

  @ApiModelProperty()
  trackingDateTime: Date;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  trackingType: string;

  @ApiModelProperty()
  courierName: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  branchCode: string;
}
