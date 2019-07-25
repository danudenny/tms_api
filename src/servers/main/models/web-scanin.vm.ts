import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';

export class WebScanInVm  {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'No Resi harus diisi'})
  awbNumber: string[];
}
