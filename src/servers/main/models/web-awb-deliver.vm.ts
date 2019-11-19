import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class WebAwbDeliverGetPayloadVm {

  @ApiModelProperty({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })

  @IsDefined({ message: 'Nomor resi harus diisi' })
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
}

export class AwbDeliverManualVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbStatusId: number;
}

export class AwbDeliverManualResponseVm {

  @ApiModelProperty({ type: () => AwbDeliverManualVm })
  awb: AwbDeliverManualVm;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebAwbDeliverGetResponseVm {
  @ApiModelProperty({ type: [AwbDeliverManualResponseVm] })
  data: AwbDeliverManualResponseVm[];
}
export class WebAwbDeliverSyncResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebDeliveryVm {
  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty({ format: 'date-time' })
  doPodDeliverDate: string;

  @ApiModelProperty()
  employeeId: number;

  // @ApiModelProperty()
  // employeeName: string;

  // @ApiModelProperty()
  // awbId: number;

  @ApiModelProperty()
  awbItemId: number;

  // @ApiModelProperty({ format: 'date-time' })
  // awbDate: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusId: number;

  // @ApiModelProperty()
  // awbStatusName: string;

  // @ApiModelProperty()
  // merchant: string;

  // @ApiModelProperty()
  // consigneeName: string;

  @ApiModelProperty()
  consigneeNameNote: string;

  // @ApiModelProperty()
  // consigneeAddress: string;

  // @ApiModelProperty()
  // consigneeNote: string;

  // @ApiModelProperty()
  // consigneeNumber: string;

  // @ApiModelProperty()
  // packageTypeName: string;

  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonNotes: string;

}

export class WebAwbDeliverSyncPayloadVm {
  @ApiModelProperty({ type: () => [WebDeliveryVm] })
  deliveries: WebDeliveryVm[];
}