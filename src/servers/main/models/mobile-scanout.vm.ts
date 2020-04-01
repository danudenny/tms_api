import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import { IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

// Scan Out Awb
export class MobileScanOutAwbVm {
  @ApiModelProperty({
    example: 203,
    skipValidation: true,
  })
  @IsDefined({ message: 'POD ID harus diisi' })
  doPodId: string;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  @IsDefined({ message: 'Nomor resi harus diisi' })
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
}

export class TransferAwbDeliverVm {
  @ApiModelProperty()
  @IsDefined({ message: 'Nomor awb harus diisi' })
  scanValue: string;
}

export class MobileScanOutCreateDeliveryVm {
  @ApiModelProperty({
    example: 123,
    skipValidation: true,
  })
  @IsDefined({ message: 'Sigesit harus diisi' })
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

export class ScanAwbDeliverPayloadVm {
  @ApiModelProperty()
  @IsDefined({ message: 'Nomor awb harus diisi' })
  scanValue: string;

  @ApiModelProperty()
  @IsDefined({ message: 'Nomor surat jalan harus diisi' })
  doPodDeliverId: string;
}
