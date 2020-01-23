import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';

export class MobileScanInVm  {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({message: 'No Resi harus diisi'})
  @IsAwbNumber({ message: 'No Resi tidak sesuai' })
  @Type(() => String)
  awbNumber: string[];
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

export class ScanBranchAwbVm extends ScanInputNumberLoadBranchVm {
  @ApiModelProperty({ type: [ScanBranchBagVm] })
  dataBag: ScanBranchBagVm;
}

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


export class MobileScanInBagBranchResponseVm {
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
export class MobileScanInBagBranchVm {
  @ApiModelProperty()
  @IsDefined({ message: 'No harus diisi' })
  scanValue: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelProperty()
  date: string;
}

export class MobileScanInBranchResponseVm {
  @ApiModelProperty()
  service: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneePhone: string;

  @ApiModelProperty()
  totalCodValue: string;

  @ApiModelProperty()
  dateTime: string;

  @ApiModelProperty()
  podScanInBranchId: string;
  
  @ApiModelProperty({ type: [ScanInputNumberBranchVm] })
  data: ScanInputNumberBranchVm[];
}

export class MobileScanInDetailVm {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({ message: 'No harus diisi' })
  scanValue: string;
}