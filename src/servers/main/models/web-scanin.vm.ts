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

export class WebScanInBagBranchVm {
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

export class ScanValidateBranchVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  totalAwbInBag: number;

  @ApiModelProperty()
  totalAwbScan: number;

  @ApiModelProperty()
  totalAwbMore: number;

  @ApiModelProperty()
  totalAwbLess: number;

}

export class WebScanInValidateBranchVm {

  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelPropertyOptional()
  notes?: string;

  @ApiModelPropertyOptional({type: [ScanValidateBranchVm]})
  bagNumberDetail?: ScanValidateBranchVm[];

}

// Response
export class ScanInputNumberBranchVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class ScanInputNumberLoadBranchVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanInLoadBranchResponseVm   {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  AwbDetail: ScanInputNumberLoadBranchVm[];
}

export class ScanBranchBagVm {
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

export class WebScanInBagBranchResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: () => ScanBranchBagVm })
  dataBag: ScanBranchBagVm;

  @ApiModelProperty({ type: [ScanInputNumberBranchVm] })
  data: ScanInputNumberBranchVm[];
}

export class ScanBranchAwbVm extends ScanInputNumberLoadBranchVm {
  @ApiModelProperty({ type: [ScanBranchBagVm] })
  dataBag: ScanBranchBagVm;
}

export class WebScanInBranchResponseVm {
  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  isBag: boolean;

  @ApiModelProperty({ type: [ScanBranchBagVm] })
  dataBag: ScanBranchBagVm;

  @ApiModelProperty({ type: [ScanInputNumberBranchVm] })
  data: ScanInputNumberBranchVm[];

}

export class ScanInAwbLoadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  isFiltered: boolean;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class ScanInBagLoadVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty({ type: [ScanInAwbLoadVm] })
  awb: ScanInAwbLoadVm[];
}

export class WebScanInBranchLoadResponseVm {
  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty({ type: [ScanInBagLoadVm] })
  data: ScanInBagLoadVm[];
}