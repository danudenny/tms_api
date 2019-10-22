import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';
import { AwbHistory } from 'src/shared/orm-entity/awb-history';
import { DatetimeAttributeValue } from 'aws-sdk/clients/clouddirectory';

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