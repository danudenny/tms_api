import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
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

export class AwbDeliverManualSync {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebAwbDeliverSyncResponseVm {
  @ApiModelProperty({ type: [AwbDeliverManualSync] })
  data: AwbDeliverManualSync[];
}

export class WebDeliveryVm {
  @ApiModelPropertyOptional()
  doPodDeliverDetailId: string;

  @ApiModelPropertyOptional()
  doPodDeliverId: string;

  @ApiModelPropertyOptional({ format: 'date-time' })
  doPodDeliverDate: string;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelPropertyOptional()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  consigneeNameNote: string;

  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonNotes: string;

  @ApiModelProperty()
  totalCodValue: number;
}

export class WebAwbDeliverSyncPayloadVm {
  @ApiModelPropertyOptional()
  isReturn: boolean;

  @ApiModelProperty({ type: () => [WebDeliveryVm] })
  deliveries: WebDeliveryVm[];
}
