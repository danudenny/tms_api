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
