import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBagNumber } from '../../../shared/decorators/custom-validation.decorator';

export class WebScanInBaggingVm  {

  @ApiModelProperty({
    example: ['BGG/12321', 'BGG/1120394'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No Bagging harus diisi'})
  @Type(() => String)
  baggingNumber: string[];

  @ApiModelPropertyOptional({
    example: [0, 1],
  })
  @IsDefined({message: 'hubId harus bernilai number 1 atau 0'})
  @Type(() => Number)
  hubId: 0 | 1;
}

export class WebScanInBagRepresentativeVm  {

  @ApiModelProperty({
    example: ['GSK/12321', 'GSK/1120394'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No Gabung Sortir Kota harus diisi'})
  @Type(() => String)
  bagRepresentativeNumber: string[];

  @ApiModelPropertyOptional({
    example: [0, 1],
  })
  @IsDefined({message: 'hubId harus bernilai number 1 atau 0'})
  @Type(() => Number)
  hubId: 0 | 1;
}
