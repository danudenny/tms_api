import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsBagNumber, IsBagNumberSingle } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

export class WebScanInBagVm  {

  @ApiModelProperty({
    example: ['112039', '1120394'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No gabung paket harus diisi'})
  @IsBagNumber({ message: 'No gabung paket tidak sesuai' })
  @Type(() => String)
  bagNumber: string[];
}

export class WebScanInValidateBagVm  {

  @ApiModelProperty({
    example: ['112039', '1120394'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No gabung paket harus diisi'})
  @IsBagNumberSingle({ message: 'No gabung paket tidak sesuai' })
  @Type(() => String)
  bagNumber: string;

  @ApiModelProperty()
  representativeIdTo: number;

  @ApiModelProperty()
  podFilterId: number;
}