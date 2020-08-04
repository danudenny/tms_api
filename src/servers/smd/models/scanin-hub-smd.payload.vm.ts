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
}
