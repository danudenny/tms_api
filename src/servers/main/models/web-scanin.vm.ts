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
  scanValue: string[];

  @ApiModelProperty()
  bagNumber: string;

}

export class WebScanInBranchHubVm {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({ message: 'No harus diisi' })
  bagNumber: string[];

  @ApiModelProperty()
  doPodCode: string;
}

export class WebScanInValidateBranchVm {
  @ApiModelProperty()
  verifyCode: string;

  @ApiModelProperty()
  notes: string;

  @ApiModelProperty()
  totalAwbScan: number;

  @ApiModelProperty()
  totalAwb: number;
}
// Response
export class ScanInputNumberBranchVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  // @ApiModelProperty()
  // isBag: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanInBranchResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  bagNumber: string;
  // @ApiModelProperty()
  // totalSuccessAwb: number;

  // @ApiModelProperty()
  // totalSuccessBag: number;

  // @ApiModelProperty()
  // totalError: number;

  @ApiModelProperty()
  isBag: boolean;

  @ApiModelProperty({ type: [ScanInputNumberBranchVm] })
  data: ScanInputNumberBranchVm[];
}
