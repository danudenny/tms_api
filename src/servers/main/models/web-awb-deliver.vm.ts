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
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebAwbDeliverGetResponseVm {
  @ApiModelProperty({ type: [AwbDeliverManualResponseVm] })
  data: AwbDeliverManualResponseVm[];
}
