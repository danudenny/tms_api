
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import { IsAwbNumber } from '../../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

export class WebDoPodCreateReturnPayloadVm {
  @ApiModelPropertyOptional({
    example: 123,
  })
  userIdDriver: number;

  @ApiModelPropertyOptional({
    example: '2019-05-01 00:00:00',
    format: 'date-time',
  })
  doPodDateTime: string;

  @ApiModelPropertyOptional({
    example: 'keterangan',
  })
  desc?: string;
}

export class WebScanAwbReturnPayloadVm  {
  @ApiModelProperty({
    example: 203,
    skipValidation: true,
  })
  @IsDefined({message: 'POD ID harus diisi'})
  doPodReturnId: string;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })

  @IsDefined({message: 'Nomor resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
}

export class MobileScanAwbReturnPayloadVm {
  @ApiModelProperty()
  @IsDefined({ message: 'Nomor awb harus diisi' })
  // @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string;

  @ApiModelProperty()
  @IsDefined({ message: 'Nomor surat jalan harus diisi' })
  doPodReturnId: string;
}
