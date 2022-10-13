import { IsDefined } from 'class-validator';
import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DoSmdSanityPayloadVm {
  @ApiModelProperty({
    example: ['1203123312', '3503156312', '9007856343'],
  })
  @IsDefined({ message: 'DoSmdId tidak boleh kosong' })
  doSmdId?: [];
}
