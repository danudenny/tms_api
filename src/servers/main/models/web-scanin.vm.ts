import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsAwbNumber } from '../../../shared/decorators/custom-validation.decorator';
import { Type } from 'class-transformer';
import { AwbDetail } from 'src/shared/orm-entity/awb-detail';

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
  notes: string;

  @ApiModelProperty()
  bagNumber: string[];

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
