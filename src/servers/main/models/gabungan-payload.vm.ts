import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';
import { IsDefined } from 'class-validator';

export class GabunganPayloadVm {
  // @ApiModelProperty()
  // permissionToken: string;

  @ApiModelProperty()
  tujuan: string;

  @ApiModelProperty()
  employeName: string;

  @ApiModelProperty()
  bagDateReal: Date;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  awbNumber: string[];
}

export class PackagePayloadVm {

  @ApiModelProperty({
    example: 'CGK10003',
    skipValidation: true,
  })
  @IsDefined({ message: 'Tidak boleh kosong' })
  value: string;

  @ApiModelPropertyOptional({
    example: 12,
  })
  branchId?: number;

  @ApiModelPropertyOptional({
    example: [1203483, 2390493, 9203920932],
  })
  awbItemId?: [];

  @ApiModelPropertyOptional({
    example: 1129348,
  })
  bagItemId?: number;

  @ApiModelPropertyOptional({
    example: 'GS002939403001',
  })
  bagNumber?: string;

  @ApiModelPropertyOptional({
    example: '112',
  })
  podScanInHubId?: string;
}

export class PackageBackupPayloadVm {

  @ApiModelProperty({
    example: 'CGK10003',
    skipValidation: true,
  })
  @IsDefined({ message: 'Tidak boleh kosong' })
  value: string;

  @ApiModelPropertyOptional({
    example: 12,
  })
  districtId?: number;

  @ApiModelPropertyOptional({
    example: [1203483, 2390493, 9203920932],
  })
  awbItemId?: [];

  @ApiModelPropertyOptional({
    example: 1129348,
  })
  bagItemId?: number;

  @ApiModelPropertyOptional({
    example: 'GS002939403001',
  })
  bagNumber?: string;

  @ApiModelPropertyOptional({
    example: '112',
  })
  podScanInHubId?: number;
}
