import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';

export class WebScanInBagVm  {

  @ApiModelProperty({
    example: ['112039', '1120394'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No gabung paket harus diisi'})
  bagNumber: string[];
}
