import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsBranchCode } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

export class WebScanInBranchVm  {

  @ApiModelProperty({
    example: ['PWA', 'BDG'],
    skipValidation: true,
  })
  // TODO: validation if array length = 0
  @IsDefined({message: 'Perwakilan harus diisi'})
  @IsBranchCode({ message: 'Perwakilan tidak sesuai' })
  @Type(() => String)
  representativeCode: string;
}

export class WebVerificationAwbVm  {
  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  isMatch: boolean;

  @ApiModelProperty()
  podFilterDetailId: number;

  @ApiModelProperty()
  podFilterId: number;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  bagNumber: string;
}
