import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class WebAwbReturnCancelCreatePayload {
  @IsDefined({message: 'Nomor resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  scanValue: string[];

  @ApiModelProperty()
  notes: string;
}