import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { SearchColumnsVm, WebDeliverySearchVm } from '../../../shared/models/base-filter-search.payload.vm';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsBagNumber, IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

// Scan Out Awb
export class WebScanOutAwbVm  {
  @ApiModelProperty({
    example: 203,
    skipValidation: true,
  })
  @IsDefined({message: 'POD ID harus diisi'})
  doPodId: string;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })

  @IsDefined({message: 'Nomor resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
}

export class WebScanOutAwbValidateVm {
  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'Nomor resi harus diisi' })
  awbNumber: string;
}

export class WebScanOutBagValidateVm {
  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'Nomor bag harus diisi' })
  bagNumber: string;
}

export class WebScanOutLoadForEditVm {
  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'Do Pod Id harus diisi' })
  doPodId: string;

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'Do Pod Method harus diisi' })
  doPodMethod: string;
}

export class WebScanOutBagForPrintVm {
  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'Do Pod Id harus diisi' })
  doPodId: string;
}

// Scan Out Bag
export class WebScanOutBagVm {
  @ApiModelProperty({
    example: 23,
    skipValidation: true,
  })
  @IsDefined({message: 'POD ID harus diisi'})
  doPodId: number;

  @ApiModelProperty()
  isTransit: boolean;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No gabung paket harus diisi'})
  @IsBagNumber({ message: 'No gabung paket tidak sesuai' })
  @Type(() => String)
  bagNumber: string[];
}

// Scan Out Awb List
export class FilterScanOutAwbListVm {

  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  doPodCode: string;

}

export class WebScanOutAwbListPayloadVm extends BaseMetaPayloadVm {
}

export class WebScanOutVm {

  @ApiModelPropertyOptional({
    example: 'internal, 3pl',
  })
  doPodMethod?: string;

  @ApiModelProperty({
    skipValidation: true,
    example: 23,
  })
  @IsDefined({message: 'Gerai tujuan harus diisi'})
  branchIdTo: number;

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({message: 'Driver harus diisi'})
  userIdDriver: number;

  @ApiModelPropertyOptional()
  partnerLogisticId?: string;

  @ApiModelProperty({
    skipValidation: true,
    example: 'DPS-1701001-1234-ABC',
  })
  @IsDefined({message: 'Nomor mobil harus diisi'})
  vehicleNumber: string;

  @ApiModelPropertyOptional()
  desc?: string;

  @ApiModelPropertyOptional()
  totalBag?: number;
}

// Create DO POD
export class WebScanOutCreateVm extends WebScanOutVm {

  @ApiModelProperty({
    example: 8000,
    skipValidation: true,
  })
  @IsDefined({message: 'Tipe POD harus diisi'})
  doPodType: number;

  @ApiModelProperty({
    example: '2019-05-01 00:00:00',
    skipValidation: true,
  })
  @IsDefined({message: 'Tanggal pengiriman harus diisi'})
  doPodDateTime: string;

  @ApiModelPropertyOptional()
  base64Image?: string;

}

// Edit DO POD AWB
export class WebScanOutEditVm extends WebScanOutVm {

  @ApiModelProperty({
    example: 'asdkjashfhasifhasifhasihf',
    skipValidation: true,
  })
  @IsDefined({message: 'POD ID harus diisi'})
  doPodId: string;

  @ApiModelPropertyOptional({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // @IsDefined({message: 'Nomor resi harus diisi'})
  // @ValidateNested({ each: true })
  // @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  addAwbNumber: string[];

  @ApiModelPropertyOptional({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // @IsDefined({message: 'Nomor resi harus diisi'})
  // @ValidateNested({ each: true })
  // @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  removeAwbNumber: string[];
}

// Edit DO POD BAG
export class WebScanOutEditHubVm extends WebScanOutVm {

  @ApiModelProperty({
    example: 203,
    skipValidation: true,
  })
  @IsDefined({message: 'POD ID harus diisi'})
  doPodId: string;

  @ApiModelPropertyOptional({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // @IsDefined({message: 'Nomor resi harus diisi'})
  // @IsBagNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  addBagNumber: string[];

  @ApiModelPropertyOptional({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // @IsDefined({message: 'Nomor resi harus diisi'})
  // @IsBagNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  removeBagNumber: string[];
}

// Create DO POD Delivery
export class WebScanOutCreateDeliveryVm {
  @ApiModelProperty({
    example: 123,
    skipValidation: true,
  })
  @IsDefined({message: 'Sigesit harus diisi'})
  userIdDriver: number;

  @ApiModelProperty({
    example: '2019-05-01 00:00:00',
    skipValidation: true,
  })
  @IsDefined({message: 'Tanggal pengiriman harus diisi'})
  doPodDateTime: string;

  @ApiModelPropertyOptional({
    example: 'keterangan',
  })
  desc?: string;
}

export class WebScanOutDeliverEditVm {
  @ApiModelProperty({
    example: 'asdkjashfhasifhasifhasihf',
    skipValidation: true,
  })
  @IsDefined({ message: 'POD ID harus diisi' })
  doPodDeliverId: string;

  @ApiModelProperty({
    example: 123,
    skipValidation: true,
  })
  @IsDefined({message: 'Sigesit harus diisi'})
  userIdDriver: number;

  @ApiModelPropertyOptional({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // @IsDefined({message: 'Nomor resi harus diisi'})
  // @ValidateNested({ each: true })
  // @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  addAwbNumber: string[];

  @ApiModelPropertyOptional({
    example: ['00020001', '00020002'],
    skipValidation: true,
  })
  // @IsDefined({message: 'Nomor resi harus diisi'})
  // @ValidateNested({ each: true })
  // @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  removeAwbNumber: string[];
}
