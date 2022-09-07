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

export class V2WebScanInBagBranchVm {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({ message: 'No harus diisi' })
  scanValue: string[];

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  podScanInBranchId: string;
}



// Response
export class V2ScanInputNumberBranchVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  routeAndPriority: string;

  @ApiModelProperty()
  kelurahan: string;
}

export class V2ScanBranchBagVm {
  @ApiModelProperty()
  bagId: number;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}


export class V2WebScanInBranchResponseVm {
  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  isBag: boolean;

  @ApiModelProperty({ type: [V2ScanBranchBagVm] })
  dataBag: V2ScanBranchBagVm;

  @ApiModelProperty({ type: [V2ScanInputNumberBranchVm] })
  data: V2ScanInputNumberBranchVm[];
}
