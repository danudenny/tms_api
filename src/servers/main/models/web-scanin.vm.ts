import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

export class WebScanInVm  {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({message: 'No Resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
}

export class WebScanInBranchVm {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({ message: 'No harus diisi' })
  inputNumber: string[];
}

// Response
export class ScanInputNumberBranchVm {
  @ApiModelProperty()
  inputNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  isBag: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanInBranchResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccessAwb: number;

  @ApiModelProperty()
  totalSuccessBag: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanInputNumberBranchVm] })
  data: ScanInputNumberBranchVm[];
}
