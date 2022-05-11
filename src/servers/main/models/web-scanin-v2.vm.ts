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


// export class ScanValidateBranchVm {
//   @ApiModelProperty()
//   bagNumber: string;

//   @ApiModelProperty()
//   totalAwbInBag: number;

//   @ApiModelProperty()
//   totalAwbScan: number;

//   @ApiModelProperty()
//   totalAwbMore: number;

//   @ApiModelProperty()
//   totalAwbLess: number;

// }


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
}

// export class V2ScanInputNumberLoadBranchVm {
//   @ApiModelProperty()
//   awbNumber: string;

//   @ApiModelProperty()
//   status: string;

//   @ApiModelProperty()
//   trouble: boolean;

//   @ApiModelProperty()
//   message: string;
// }

// export class V2WebScanInLoadBranchResponseVm   {
//   @ApiModelProperty()
//   bagNumber: string;

//   @ApiModelProperty()
//   AwbDetail: V2ScanInputNumberLoadBranchVm[];
// }

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

// export class WebScanInBagBranchResponseVm {
//   @ApiModelProperty()
//   totalData: number;

//   @ApiModelProperty()
//   totalSuccess: number;

//   @ApiModelProperty()
//   totalError: number;

//   @ApiModelProperty({ type: () => V2ScanBranchBagVm })
//   dataBag: V2ScanBranchBagVm;

//   @ApiModelProperty({ type: [V2ScanInputNumberBranchVm] })
//   data: V2ScanInputNumberBranchVm[];
// }

// export class ScanBranchAwbVm extends V2ScanInputNumberLoadBranchVm {
//   @ApiModelProperty({ type: [V2ScanBranchBagVm] })
//   dataBag: V2ScanBranchBagVm;
// }

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

// export class ScanInAwbLoadVm {
//   @ApiModelProperty()
//   awbNumber: string;

//   @ApiModelProperty()
//   trouble: boolean;

//   @ApiModelProperty()
//   isFiltered: boolean;

//   @ApiModelProperty()
//   status: string;

//   @ApiModelProperty()
//   message: string;
// }

// export class ScanInBagLoadVm {
//   @ApiModelProperty()
//   bagNumber: string;

//   @ApiModelProperty({ type: [ScanInAwbLoadVm] })
//   awb: ScanInAwbLoadVm[];
// }

// export class WebScanInBranchLoadResponseVm {
//   @ApiModelProperty()
//   podScanInBranchId: string;

//   @ApiModelProperty({ type: [ScanInBagLoadVm] })
//   data: ScanInBagLoadVm[];
// }

// export class HubDeliveryInExcelExecuteVm {
//   @ApiModelProperty()
//   id: string;
// }
