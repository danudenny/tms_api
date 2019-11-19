import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';

export class AwbUpdateStatusPayloadVm {
  @ApiModelProperty({
    example: ['112039', '11203922'],
    skipValidation: true,
  })
  @IsDefined({message: 'No harus diisi'})
  inputNumber: string[];

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'Awb Status harus diisi' })
  awbStatusId: number;
}
export class ScanInputNumberVm {
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

export class AwbUpdateStatusResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccessAwb: number;

  @ApiModelProperty()
  totalSuccessBag: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanInputNumberVm] })
  data: ScanInputNumberVm[];
}

export class AwbUpdateDestinationPayloadVm {
  @ApiModelProperty({
    example: '11203922',
    skipValidation: true,
  })
  @IsDefined({message: 'No harus diisi'})
  awbNumber: string;

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'harus diisi' })
  awbItemId: number;

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'harus diisi' })
  podFilterDetailItemId: number;

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'harus diisi' })
  districtCode: string;

  @ApiModelProperty({
    skipValidation: true,
  })
  @IsDefined({ message: 'harus diisi' })
  representativeId: number;
}

export class AwbUpdateDestinationResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
