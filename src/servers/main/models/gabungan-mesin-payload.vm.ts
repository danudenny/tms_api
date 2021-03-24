import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';
import { IsDefined } from 'class-validator';

export class GabunganMesinPayloadVm {
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
 
export class PackageMachinePayloadVm {

  @ApiModelProperty({
    example: 12,
  })
  @IsDefined({ message: 'Lokasi mesin tidak boleh kosong' })
  sorting_branch_id?: number;

  @ApiModelProperty({
    example: ['1203123312', '3503156312', '9007856343'],
  })
  @IsDefined({ message: 'AWB tidak boleh kosong' })
  reference_numbers?: [];

  @ApiModelProperty({
    example: 'SEAL123490CQ',
    skipValidation: false,
  })
  @IsDefined({ message: 'Seal tidak boleh kosong' })
  tag_seal_number: string;

  @ApiModelProperty({
    example: 'SEAL123490CQ',
    skipValidation: true,
  })
  @IsDefined({ message: 'Seal tidak boleh kosong' })
  chute_number: string;

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
